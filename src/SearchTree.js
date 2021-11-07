class Node {
    constructor(value, obj){
        this.value = value
        this.obj = obj
        this.right = null
        this.left = null
    }
}
export class BinarySearchTree {
    constructor(){
        this.root = null
    }
    insert(value, obj){
        var newNode = new Node(value,obj)
        if(this.root === null){
            this.root = newNode
            return null
        }
        let current = this.root
        while(true){
            if(value === current.value) return current.obj
            if(value < current.value){
                if(current.left === null){
                    current.left = newNode
                    return null
                }
                current = current.left
            }else{
                if(current.right === null){
                    current.right = newNode
                    return null
                }
                current = current.right
            }
        }
    }
}