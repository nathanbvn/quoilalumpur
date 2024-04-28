

window.onload = function() {
    var score=0;
    var elements = document.getElementsByClassName('box');
    var ids = [];
    var cpt = 0;
    for (var i = 0; i < elements.length; i++) {
        ids.push(elements[i].id);
    }

    var elements2 = document.getElementsByClassName('rep');
    var reps = [];

    for (var i = 0; i < elements2.length; i++) {
        reps.push(elements2[i].value);
    }

    console.log(reps);

    const question = document.getElementById(ids[cpt]);
    question.style.display = 'grid';

    window.displayQuestion = function(){
        if(cpt<elements.length){
            const questions = document.querySelectorAll('.box');
            questions.forEach((question) => {
                question.style.display = 'none';
            });

            const question = document.getElementById(ids[cpt]);
            question.style.display = 'grid';

            document.getElementById("btn1").remove();
            document.getElementById("btn2").remove();
            document.getElementById("btn3").remove();
        }
        else{
            document.getElementById("btnEnd").style.display = "flex";
            document.getElementById("idScore").value = score;
        }
    }



    const delay = ms => new Promise(res => setTimeout(res, ms));

    window.lockButton = function(){
        for(let i = 1;i<4;i++){
            let btn = document.getElementById("btn" + i);
            btn.disabled = true;
            btn.style.color = "initial";
        }
    }


    window.verifyAnswer = async function (choice) {
        if (cpt != elements.length) {

          if (choice == reps[cpt]) {
            console.log("OK");
            document.getElementById("btn" + choice).style.backgroundColor = "#5eeb59";
            lockButton();
            score+=1;
          } else {
            console.log("False");
            document.getElementById("btn" + choice).style.animation = "shaking 0.2s 0s 2";
            document.getElementById("btn" + choice).style.backgroundColor = "#ed0909";
            lockButton();
            await delay(500);
            document.getElementById("btn" + reps[cpt]).style.backgroundColor = "#5eeb59";
          }
          cpt += 1;
          await delay(1000);
          displayQuestion();
        }
    };


}
