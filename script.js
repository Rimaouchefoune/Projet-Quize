var page = 1;
    var filterText = '';
    var difficultyFilter = '';
    var allQuestionsLoaded = false;

    document.addEventListener('DOMContentLoaded', function () {
        chargerQuestions();
        window.addEventListener('scroll', chargerAutomatiquement);
    });

    function chargerQuestions() {
        if (!allQuestionsLoaded) {
            var apiUrl = `https://opentdb.com/api.php?amount=100&page=${page}&type=multiple`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    // Filtrer les questions par mot clé et niveau de difficulté
                    var filteredQuestions = data.results.filter(question => {
                        var keywordMatch = filterText === '' || decodeEntities(question.question.toLowerCase()).includes(filterText.toLowerCase());
                        var difficultyMatch = difficultyFilter === '' || question.difficulty.toLowerCase() === difficultyFilter;
                        return keywordMatch && difficultyMatch;
                    });

                    afficherQuestions(filteredQuestions);

                    if (data.results.length === 0) {
                        allQuestionsLoaded = true;
                    }
                })
                
        }
    }

    function afficherQuestions(questions) {
        var questionsContainer = document.getElementById('questions-container');

        // Réinitialiser le contenu si le filtre n'est pas appliqué
        if (page === 1) {
            questionsContainer.innerHTML = '';
        }

        questions.forEach(function (question) {
            // Créer un conteneur de question
            var questionContainer = document.createElement('div');
            questionContainer.classList.add('question-container');
            questionContainer.dataset.correctAnswer = question.correct_answer;

            // Ajouter le cercle de difficulté
            var difficultyCircle = document.createElement('div');
            difficultyCircle.classList.add('difficulty-circle');
            difficultyCircle.textContent = getDifficultyEmoji(question.difficulty);
            questionContainer.appendChild(difficultyCircle);

            // Ajouter le texte de la question
            var questionText = document.createElement('p');
            questionText.innerHTML = question.question;
            questionContainer.appendChild(questionText);

            // Ajouter le conteneur de réponse
            var answerContainer = document.createElement('div');
            answerContainer.classList.add('answer-container');
            answerContainer.innerHTML = `<p>❎ ${question.correct_answer}</p>`;
            questionContainer.appendChild(answerContainer);

            // Ajouter l'événement de survol sur le cercle pour afficher la réponse
            difficultyCircle.addEventListener('mouseenter', function () {
                answerContainer.style.display = 'flex';
            });

            // Ajouter l'événement de sortie du survol pour masquer la réponse
            difficultyCircle.addEventListener('mouseleave', function () {
                answerContainer.style.display = 'none';
            });

            // Ajouter la question au conteneur principal
            questionsContainer.appendChild(questionContainer);
        });

        page++;
    }

    function chargerAutomatiquement() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            chargerQuestions();
        }
    }

    function filtrerQuestions(texteFiltre) {
        // Extraire la médaille du filtre
        var medalMatch = texteFiltre.match(/🥇|🥉|🥈/);

        if (medalMatch) {
            difficultyFilter = '';
            var medalMap = { '🥇': 'hard', '🥉': 'easy', '🥈': 'medium' };
            difficultyFilter = medalMap[medalMatch[0]];
            filterText = texteFiltre.replace(medalMatch[0], '').trim();
        } else {
            filterText = texteFiltre;
            difficultyFilter = '';
        }

        page = 1;
        allQuestionsLoaded = false;
        chargerQuestions();
    }

    function decodeEntities(encodedString) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }

    function getDifficultyEmoji(difficulty) {
        var difficultyEmojiMap = { easy: '🥉', medium: '🥈', hard: '🥇' };
        return difficultyEmojiMap[difficulty.toLowerCase()] || '';
    }