// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
const fs = require('fs');
const expr = fs.readFileSync(0, 'utf8');

//  const expr = `#simple single declaration

//  var variable: number ;`;

function arith(expr, outType) {
  const tokens = scan(expr);
  //console.log(tokens);
  if (tokens.length === 0) return '';
  let result = new DeclarationParser(tokens).parse();
  //console.log(result);
  return result;
}

function scan(str) {
  let hashTagCount = 0;
  for (let index = 0; index < str.length; index++) {
    if (str.charAt(index) === '#') hashTagCount++;
  }
  for (let index = 0; index < hashTagCount; index++) {
    let index = str.indexOf('#');
    let currentString = str.substring(index);
    let newLineIndex = currentString.indexOf('\n');
    if (newLineIndex == -1) {
      str = str.slice(0, index);
    } else {
      str = str.slice(0, index) + currentString.slice(newLineIndex);
    }
  }
  const toks = [];
  let m;
  for (let s = str; s.length > 0; s = s.slice(m[0].length)) {
    if ((m = s.match(/^[ \t\n]+/))) {
      continue; //skip linear whitespace
    } else if ((m = s.match(/^variable/))) {
      toks.push(new Token('identifier', m[0]));
    } 
    else if ((m = s.match(/^var/))) {
      toks.push(new Token('var', m[0]));
    }
    //  else if ((m = s.match(/^.+:/))) {
    //   m[0] = m[0].substring(0, m[0].length - 1);
    //   toks.push(new Token('identifier', m[0]));
    // }
    else if ((m = s.match(/^string/))) {
      toks.push(new Token('string', 'string'));
    } else if ((m = s.match(/^number/))) {
      toks.push(new Token('number', 'number'));
    } else if ((m = s.match(/^record/))) {
      toks.push(new Token('record', 'record'));
    } else if ((m = s.match(/^\d+/))) {
      toks.push(new Token('INT', m[0]));
    } else if ((m = s.match(/^end/))) {
      toks.push(new Token(m[0], m[0]));
    } else if ((m = s.match(/^:/))) {
      toks.push(new Token(m[0], m[0]));
    } else if ((m = s.match(/^;/))) {
      toks.push(new Token(m[0], m[0]));
    } else if ((m = s.match(/^[0-9a-zA-Z_]+/))) {
      // m[0] = m[0].substring(0, m[0].length - 1);
      toks.push(new Token('identifier', m[0]));
    } else if ((m = s.match(/^./))) {
      toks.push(new Token(m[0], m[0]));
    }
  }

  toks.push(new Token('EOF', 'EOF'));
  return toks;
}
//Token
class Token {
  constructor(kind, lexeme) {
    Object.assign(this, { kind, lexeme });
  }
}
//Parser common functionalities
class Parser {
  constructor(tokens) {
    this._tokens = tokens;
    this._index = 0;
    this.tok = this._nextToken(); //lookahead
  }

  //wrapper used for crude  error recovery
  parse() {
    try {
      let result = this.parseLo();
      if (!this.peek('EOF')) {
        const msg = `expecting end-of-input at "${this.tok.lexeme}"`;
        process.abort();
        throw new SyntaxError(msg);
      }
      return result;
    } catch (err) {
      return err;
    }
  }

  peek(kind) {
    return this.tok.kind === kind;
  }

  consume(kind) {
    if (this.peek(kind)) {
      this.tok = this._nextToken();
    } else {
      const msg = `expecting ${kind} at "${this.tok.lexeme}"`;
      process.abort();
      throw new SyntaxError(msg);
    }
  }

  _nextToken() {
    if (this._index < this._tokens.length) {
      return this._tokens[this._index++];
    } else {
      return new Token('EOF', '<EOF>');
    }
  }
}

//we need to use Math.trunc() to simulate integer arith
//since JS only supports floats.
class DeclarationParser extends Parser {
  constructor(expr) {
    super(expr);
  }

  parseLo() {
    return this.expr();
  }
  expr() {
    let resultArr = [];
    while (this.peek('var')) {
      //check for var
      this.consume('var');
      //create new tupple for the key and value

      let currentTupple = [];
      let tok = this.tok;
      let identifier = tok.lexeme;
      // check if identifier matches the requirements
      identifier = identifier.trim();
      if (!identifier.match(/^[A-Za-z_]\w*$/)) {
     //   console.log("Error as it doesn't match regex");
        //console.log('yaha haga hai');
        return null;
      }
      //once identifier is matched we can insert into the current tupple
      currentTupple.push(identifier);
      //check for identifier
      this.consume('identifier');
      //check for : symbol after identifier
      this.consume(':');
      //extract type token before consuming
      tok = this.tok;

      if (this.peek('string')) {
        currentTupple.push(tok.lexeme);
        this.consume('string');
      } else if (this.peek('number')) {
        currentTupple.push(tok.lexeme);
        this.consume('number');
      } else if (this.peek('record')) {
        this.consume('record');
        //console.log('dekhte kya aata hai');
        //console.log(this.record());
        let newArray = this.record();
        currentTupple.push(newArray);
        //recursive function remaining ....
      } else {
        //if the code reached here it has to fail as the type could be any of the above three options
        this.consume('number');
      }
      this.consume(';');
      resultArr.push(currentTupple);
    }
    //if it doesnot start with var it should fail
    return resultArr;
  }

  record() {
    let resultArr = [];
    while (this.peek('identifier')) {
      let currentIdentifier = this.tok.lexeme;
      let currentTupple = [];
      currentIdentifier = currentIdentifier.trim();
      if (!currentIdentifier.match(/^[A-Za-z_]\w*$/)) {
        //console.log(currentIdentifier);
    //    console.log("Error as it doesn't match regex");
      }
      //once identifier is matched we can insert into the current tupple
      currentTupple.push(currentIdentifier);
      //check for identifier
      this.consume('identifier');
      //check for : symbol after identifier
      this.consume(':');
      //extract token before consuming the token
      let tok = this.tok;

      if (this.peek('string')) {
        currentTupple.push(tok.lexeme);
        this.consume('string');
      } else if (this.peek('number')) {
        currentTupple.push(tok.lexeme);
        this.consume('number');
      } else if (this.peek('record')) {
        this.consume('record');
        currentTupple.push(this.record());
        //recursive function remaining ....
      } else {
        //if the code reached here it has to fail as the type could be any of the above three options
        this.consume('number');
      }
      this.consume(';');
      resultArr.push(currentTupple);
    }
    if(resultArr.length === 0){
      this.consume('identifier');
    }
    this.consume('end');
    return resultArr;
  }
} //DeclarationParser

//arith(expr);
//console.log(JSON.stringify(arith(expr)));
let ans = JSON.stringify(arith(expr), null, 2);
// if (typeof ans == 'string') { //error is returned in string type
//   console.log("MJXX here");
//   fs.writeFileSync(2, ans);
//   process.abort();
// }
// else {
//   fs.writeFileSync(2, ans);
// }
//fs.writeFileSync(2, ans);
console.log(ans);