import { getAnswer } from "./answer.js";

export class Game {
    chances: number;
    guessed: boolean;
    _answer: string;
    private _alphas: Array<number>;

    constructor() {
        this.guessed = false;
        this.chances = 6;
        this._answer = "";
        this._alphas = Array(26).fill(0);
    }

    async start() {
        this._answer = await getAnswer();
        for(let i=0; i<this._answer.length; i++) {
            this._alphas[this._answer.charCodeAt(i)-97]+=1;
        }
    }

    async guess(word: string): Promise<Array<string>> {
        word = word.toLowerCase();
        if(this._answer==="") {
            await this.start();
        }
        const resultData: Array<string> = ["gray", "gray", "gray", "gray", "gray"];
        if (this.guessed || this.chances<=0) {
            throw Error("You are done for today!");
        } else {
            this.chances-=1;
            let tempCharMap = Array(26).fill(0);
            for (let index = 0; index < word.length; index++) {
                const element: string = word[index];
                if(this._alphas[element.charCodeAt(0)-97]===0) {
                    continue;
                }
                if(element===this._answer[index]) {
                    tempCharMap[element.charCodeAt(0)-97]+=1;
                    resultData[index] = "green";
                }
                else if(tempCharMap[element.charCodeAt(0)-97]<this._alphas[element.charCodeAt(0)-97]){
                    resultData[index] = "yellow";
                    tempCharMap[element.charCodeAt(0)-97]+=1;
                }
            }
            if(resultData.every((v,i)=> v === "green")) {
                this.guessed = true;
            }
            return resultData;
        }
    }
}
