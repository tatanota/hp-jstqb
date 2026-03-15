// 戻るボタンの処理
function goBack() {
  // 現在のページを非表示にして、元のページを表示
  document.getElementById("incorrectQuestionsPage").style.display = "none";
  document.getElementById("content").style.display = "block";
  document.getElementById("showIncorrect").style.display = "block";//再表示
}

// モーダルを閉じる処理
document.getElementById("closeModal").onclick = () => {
  document.getElementById("resultModal").style.display = "none";
};