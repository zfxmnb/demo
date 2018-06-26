function calculator(n){
    //console.log(n)
    return n > 1 ? calculator(n - 1) + calculator(n - 2) : 1;
}

var time = new Date().getTime(),calcCount=30;
calculator(calcCount);
window.postMessag({},"*")
console.log("worker_calculator:"+(new Date().getTime()-time))
