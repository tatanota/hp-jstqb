//ローカル変数
let questionCount = 0;// 質問数をカウントする変数

let currentQuestion = null; // 現在出題されている問題を記録する変数

let selectedAnswer = '';  // ユーザーの選択を記録
let incorrectQuestions = [];// 間違えた問題を記録
let incorrectFlaggedQuestions  = [];//Xだけフィルター

let correctAnswersCount = 0;// 正解した数をカウントする変数

let isFirstQuestion = true;   // 判別するフラグ

// -----------------------------------------------------
// 外部JSONファイルを非同期で取得
function loadNextQuestion() {
  fetch("questions.json")//ファイルをサーバーから取得
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTPエラー: " + response.status);
      }
      return response.json();
    })
    .then((jsonData) => {
      if (Array.isArray(jsonData)) {//配列かどうかを確認
        const randomIndex = Math.floor(Math.random() * jsonData.length);
        const question = jsonData[randomIndex];
        displayQuestion(question);

        //console.log("question:", question);// デバッグ
        //console.log("jsonData:",jsonData);// デバッグ

      } else {
        console.error("jsonData は配列ではありません");
      }
    })
    .catch((error) => {
      console.error("次の質問の読み込みに失敗しました:", error);
    });
}

// -----------------------------------------------------
// 質問を表示する処理
function displayQuestion(question) {
  questionCount++; // 質問数をカウント
  currentQuestion = question; // 現在の質問を記録

  //console.log("question:", question);// デバッグ
  //console.log("currentQuestion:", currentQuestion);// デバッグ


  const contentDiv = document.getElementById("content");
  contentDiv.innerHTML = `
    <h5>問題番号: ${question.no}　　${question.class1}　　${question.class2}</h5>
    <h2>第: ${questionCount}問目　　正答数：${correctAnswersCount}/${questionCount}</h2>
    <br>
    <p>${question.text}</p>
    <br>
    <ul id="options"></ul>
    <button id="submitButton" class="option-button" disabled>回答する</button>
  `;

  const optionsDiv = document.getElementById("options");
  const optionLabels = ["A", "B", "C", "D"];

  // 選択肢をシャッフルし、新しい正解のラベルを再設定
  const { shuffledOptions, newAnswerLabel } = shuffleOptionsAndSetAnswer(
    question.options,
    question.answer
  );

  //console.log(`shuffledOptions${shuffledOptions}`);//デバッグ
  //console.log(`newAnswerLabel${newAnswerLabel}`);//デバッグ

  // ランダムに並び替えた選択肢にラベルを付与して表示
  shuffledOptions.forEach((text, index) => {
    const label = optionLabels[index]; // ラベルを再割り当て
    const button = document.createElement("button");
    button.textContent = `${label}`;
    button.classList.add("option-button");
    button.onclick = () => handleOptionClick(label);

    const li = document.createElement("li");
    li.textContent = `${label}. ${text}`;
    optionsDiv.appendChild(li);
    optionsDiv.appendChild(button);
  });

  // 回答ボタンのクリックイベント
  document.getElementById("submitButton").onclick = () =>
    handleSubmit(shuffledOptions, newAnswerLabel);
}



// -----------------------------------------------------
// 選択肢をシャッフルし、新しい正解のラベルを設定する関数
function shuffleOptionsAndSetAnswer(options, currentAnswerLabel) {
  const optionLabels = ["A", "B", "C", "D"];
  const correctOption = options[optionLabels.indexOf(currentAnswerLabel)]; // 現在の正答を取得

  // 選択肢をシャッフル
  const shuffledOptions = shuffleArray([...options]);

  // 新しい正答のラベルを取得
  const newAnswerIndex = shuffledOptions.indexOf(correctOption);
  const newAnswerLabel = optionLabels[newAnswerIndex];

  //console.log(`New: ${newAnswerLabel}`);// デバッグ
  

  return { shuffledOptions, newAnswerLabel };
}

// -----------------------------------------------------
// 配列をランダムにシャッフルする関数
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// -----------------------------------------------------
// 選択肢ボタンがクリックされたときの処理
function handleOptionClick(label) {
  selectedAnswer = label; // ユーザーの選択を記録
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = false; // 回答ボタンを有効化

  // 全ての選択肢ボタンのスタイルをリセット
  const buttons = document.querySelectorAll(".option-button");
  buttons.forEach((button) => {
    button.style.backgroundColor = ""; // 背景色をリセット
    button.style.color = ""; // テキスト色をリセット
    button.style.border = ""; // ボーダーをリセット
  });

  // 選択したボタンのスタイルを変更
  const selectedButton = Array.from(buttons).find(
    (button) => button.textContent === label
  );
  if (selectedButton) {
    selectedButton.style.backgroundColor = "lightblue"; // 背景色を設定
    selectedButton.style.color = "white"; // テキスト色を変更
    selectedButton.style.border = "2px solid blue"; // ボーダーを強調
  }

  //console.log(`選択: ${selectedAnswer}`);//デバッグ
  
}

// -----------------------------------------------------
// 回答が送信されたときの処理
function handleSubmit(shuffledOptions, newAnswerLabel) {
  const resultModal = document.getElementById("resultModal");
  const resultMessage = document.getElementById("resultMessage");

  // 結果メッセージの設定
  const message = selectedAnswer === newAnswerLabel
    ? `正解です！選択したのは "${selectedAnswer}"`
    : `不正解です。正しい答えは "${newAnswerLabel}" でした。`;

  resultMessage.textContent = message;
  resultModal.style.display = "block";

  // 正解/不正解の処理
  const isCorrect = selectedAnswer === newAnswerLabel;
  if (isCorrect) {
    correctAnswersCount++;
    removeIncorrectQuestion(currentQuestion.no);  // 間違えた問題を削除
  }
  
  // 間違えた問題を記録
  recordQuestion(isCorrect ? "〇" : "×");

  // Local Storage に保存
  saveIncorrectQuestionsToLocalStorage();

  // 次の質問に進む
  document.getElementById("nextQuestionButton").onclick = () => {
    resultModal.style.display = "none";
    proceedToNextQuestion();
  };
}

// -----------------------------------------------------
// 間違えた問題を削除　
function removeIncorrectQuestion(questionNo) {
  const index = incorrectQuestions.findIndex((entry) => entry.no === questionNo);
  if (index !== -1) {
    incorrectQuestions.splice(index, 1); // 該当の問題を削除
  }
}

// -----------------------------------------------------
// 問題を記録
function recordQuestion(flag) {
  incorrectQuestions.push({
    date: new Date().toLocaleDateString(),
    flag: flag,
    no: currentQuestion.no,
    class1: currentQuestion.class1,
    class2: currentQuestion.class2,
    text: currentQuestion.text,
    options: currentQuestion.options,
    answer: currentQuestion.answer,
  });
}

// -----------------------------------------------------
// 次の質問に進む
function proceedToNextQuestion() {
  if (isFirstQuestion) {
    loadNextQuestion(); // 初回の場合は通常の質問を表示
  } else {
    if (incorrectFlaggedQuestions.length === 0) {
      alert("間違えた問題が無くなりました　全問から出題します。");
      isFirstQuestion = true; // フラグを変更
      loadNextQuestion(); // 通常の質問を表示
    } else {
      const randomIndex = Math.floor(Math.random() * incorrectQuestions.length);
      displayQuestion(incorrectFlaggedQuestions[randomIndex]); // ランダムな問題を選択して表示
    }
  }
}


// -----------------------------------------------------
// ページ表示や間違えた問題の一覧表示時に Local Storage からデータを使用
function createIncorrectQuestionsTable() {
  const incorrectQuestionsList = document.getElementById("incorrectQuestionsList");
  incorrectQuestionsList.innerHTML = ""; // リストをクリア

  // テーブルのヘッダーを作成
  incorrectQuestionsList.innerHTML = `
   <table border="1">
     <thead>
       <tr>
          <th>回答日</th>
          <th>正答</th>
          <th>問題番号</th>
          <th>大分類</th>
          <th>中分類</th>
          <th>質問内容</th>
       </tr>
     </thead>
     <tbody>
     </tbody>
   </table>
 `;

  const tableBody = incorrectQuestionsList.querySelector("tbody");

  // 間違えた問題をテーブルに追加
  incorrectQuestions.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.flag}</td>
      <td>${entry.no}</td>
      <td>${entry.class1}</td>
      <td>${entry.class2}</td>
      <td>${entry.text}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// -----------------------------------------------------
// ページ表示や間違えた問題の一覧表示時に Local Storage からデータを使用
function showIncorrectQuestions() {
  loadIncorrectQuestionsFromLocalStorage(); // 最新のデータをロード

  // 間違えた問題のテーブル作成
  createIncorrectQuestionsTable();

  // 現在のページを非表示にして、間違えた問題一覧ページを表示
  document.getElementById("content").style.display = "none";
  document.getElementById("incorrectQuestionsPage").style.display = "block";
  document.getElementById("showIncorrect").style.display = "none";
}

// -----------------------------------------------------
// 間違えた問題だけの出題ページ
function IncorrectAllQuestions() {
  if (incorrectQuestions.length === 0) {
    console.log("間違えた問題がありません。");
    alert("間違えた問題がありません。");
    return;
  }

  correctAnswersCount = 0;
  questionCount = 0;

  document.getElementById("incorrectQuestionsPage").style.display = "none";
  document.getElementById("content").style.display = "block";
  //document.getElementById("incorrectQuestionsList").innerHTML = ""; // リストをクリア
  document.getElementById("showIncorrect").style.display = "block";//再表示



  // '×' のフラグを持つ問題のみをフィルタリング
  const incorrectFlaggedQuestions = incorrectQuestions.filter(question => question.flag === "×");

  // ランダムなインデックスを生成（incorrectFlaggedQuestions.length を使用）
  const randomIndex = Math.floor(Math.random() * incorrectFlaggedQuestions.length);
  
  displayQuestion(incorrectFlaggedQuestions[randomIndex]); // ランダムな問題を選択して表示
  isFirstQuestion = false; // フラグを変更

}

// -----------------------------------------------------
// Local Storage に保存
function saveIncorrectQuestionsToLocalStorage() {
  localStorage.setItem("incorrectQuestions", JSON.stringify(incorrectQuestions));
}

// -----------------------------------------------------
// Local Storage から読み込み
function loadIncorrectQuestionsFromLocalStorage() {
  const storedData = localStorage.getItem("incorrectQuestions");
  if (storedData) {
    incorrectQuestions = JSON.parse(storedData);
  } else {
    incorrectQuestions = []; // データが無い場合は空の配列
  }
}

// ページ読み込み時に Local Storage からデータをロード
loadIncorrectQuestionsFromLocalStorage();


// -----------------------------------------------------
function clearLocalStorage() {
  localStorage.clear();
  //console.log("Local Storage をすべてクリアしました！");
  incorrectQuestionsList.innerHTML = "";
}

// -----------------------------------------------------
// 初期状態で質問を表示 js呼び出し後にloadNextQuestionを起動
loadNextQuestion();