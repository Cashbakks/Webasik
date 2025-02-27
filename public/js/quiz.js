// document.getElementById("quizForm").addEventListener("submit", async function (event) {
//     event.preventDefault();

//     const attemptId = document.getElementById("quizForm").dataset.attemptId; // Retrieve attemptId safely
//     if (!attemptId || attemptId === "undefined") {
//         alert("Error: Attempt ID is missing.");
//         return;
//     }

//     const answers = [];
//     const questionElements = document.querySelectorAll('.quiz-question');

//     questionElements.forEach((question, index) => {
//         const selectedAnswer = question.querySelector('input[type="radio"]:checked');
//         if (selectedAnswer) {
//             answers.push(selectedAnswer.value);
//         } else {
//             answers.push('');
//         }
//     });

//     const response = await fetch(`/quiz/submit/${attemptId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ answers }),
//     });

//     const result = await response.json();
//     if (result.success) {
//         alert(`Your score is: ${result.score}/5. You got a ${result.discount}% discount!`);
//     } else {
//         alert("Failed to submit quiz. Please try again.");
//     }
// });
