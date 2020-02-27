// 堆栈
class Stack {

    constructor(){
        this.items = [];
    }

    push(element){
        this.items.push(element);
    }

    pop(){
        return this.items.pop();
    }

    peek(){
        return this.items[this.items.length-1];
    }

    values(){
        return this.items;
    }

    get isEmpty(){
        return this.items.length === 0;
    }

    get size(){
        return this.items.length;
    }

    clear(){
        this.items = [];
    }

    print(){
        console.log(this.items.toString());
    }

    toString(){
        return this.items.toString();
    }
}

module.exports = Stack;