// Ogid_class.js
'use strict';

class Ogid {
  constructor(ogidstr = "OGID=-------:00:0") {
    this._ogid = ogidstr;
    this._parse_ogid(ogidstr);
    this.pointmax = this._position.length - 1;
    this._parse_position(this._position); // ボード状態を解析
  }

  // ogidをパースし状態をローカル変数に格納
  _parse_ogid(ogidstr) {
    const ogidstr2 = ogidstr.substr("OGID=".length);
    const s = ogidstr2.split(":");

    this._position = s[0];
    this._set_dice(s[1]);
    this._player = Number(s[2]);
    this._parse_position(this._position); // ボード状態を解析
  }

  _set_dice(dicestr) {
    this._dice = dicestr;
    const dice1 = Number(dicestr.substr(0,1));
    const dice2 = Number(dicestr.substr(1,1));
    this.zorome = (dicestr != "00" && dice1 == dice2);

    let usabledice = [];
    usabledice.push(dice1);
    usabledice.push(dice2);
    if (this.zorome) {
      usabledice.push(dice1);
      usabledice.push(dice1);
    }
    this._usable_dice = usabledice.sort(); //ベアオフで後ろから使うように昇順にしておく
  }

  _parse_position(pt) {
    this._ptno = [];
    //ポジション情報をパースし状態をローカル変数に格納
    const posary = pt.split("");  // 一文字ずつに分解
    for (let i = 0; i <= this.pointmax; i++) {
      const asc = posary[i].charCodeAt(0);
      if (asc == "-".charCodeAt(0)) {
        this._ptno[i] = 0;
      } else if (asc >= "A".charCodeAt(0) && asc <= "Z".charCodeAt(0)) {
        this._ptno[i] = asc - "A".charCodeAt(0) + 1;
      }
    }
  }

  _makeogidStr() {
    return "OGID=" + this._position + ":" + this._dice + ":" + this._player;
  }

  // getter functions
  get_ogidstr()  { return this._ogid; }
  get_position() { return this._position; }
  get_player()   { return this._player; }
  get_dice()     { return this._dice; }
  get_ptno(x)    { return this._ptno[x]; }

  //setter method
  set position(x) { this._position = x; this._ogid = this._makeogidStr(); this._parse_position(x); }
  set player(x)   { this._player = x;   this._ogid = this._makeogidStr(); }
  set dice(x)     { this._set_dice(x);  this._ogid = this._makeogidStr(); }

  //getter method
  get ogidstr()  { return this._ogid; }
  get position() { return this._position; }
  get player()   { return this._player; }
  get dice()     { return this._dice; }

//public and private(helper) functions

  _incdec(chr, delta, turn=1) {
    const stdchar = (turn == 1) ? "A" : "a";
    const charcd = stdchar.charCodeAt(0);
    const numbfr = (chr == "-") ? 0 : chr.charCodeAt(0) - charcd + 1;
    const numaft = numbfr + delta;
    return (numaft == 0) ? "-" : String.fromCharCode(numaft + charcd - 1);
  }

  moveChequer(fr, to) {
    const posary = this.position.split("");
    posary[fr] = this._incdec(posary[fr], -1);
    posary[to] = this._incdec(posary[to], +1);
    this._use_dice(fr, to);
    this.position = posary.join("");
    return this;
  }

  _use_dice(fr, to) {
    const dd = fr - to;
    const idx = this._usable_dice.findIndex(d => d == dd);
    if (idx != -1) {
      this._usable_dice.splice(idx, 1); //見つかればそれを削除
    } else if (dd == this._usable_dice[0] + this._usable_dice[1]) {
      this._usable_dice.splice(0, 2);   //目を組み合わせて使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2]) {
      this._usable_dice.splice(0, 3);   //ゾロ目のときは前から使う
    } else if (dd == this._usable_dice[0] + this._usable_dice[1] + this._usable_dice[2] + this._usable_dice[3]) {
      this._usable_dice.splice(0, 4);
    } else if (to == 0) {
      this._usable_dice.splice(-1, 1);  //上記で使えなかったときは大きい目から使う
    }
  }

  existMyChequer(pt) {
    return (this._ptno[pt] > 0);
  }

  isBearoffAll() {
    return (this._ptno[0] == 4);
  }

  isMovable(fr, to) {
    const movable = this.movablePoint(fr);
    return movable.includes(to);
  }

  makeMovableList() {
    //盤面から動かせる駒のリストを作る
    this._topt = ((f, d) => (f - d < 0) ? 0 : (f - d));
    this._movablelist = [];
    const piplist = this._makeDicePipList();
    for (let fr = 1; fr <= this.pointmax; fr++) {
      if (!this.existMyChequer(fr)) { continue; }

      let piplistidx = 0;
      for (const pip of piplist) {
        const to = this._topt(fr, pip); //ムーブ先を計算
        const diceodr = (this.zorome || piplistidx == 0) ? piplistidx + 1 : piplistidx;
        piplistidx += 1;

        if (to == 0) {
          if (fr - pip < 0) { //目を余らせてベアオフするときは
            if (this._existBacker(fr)) { continue; } //後ろに駒がないこと
            if (diceodr >= 2) { continue; } //ダイスの目を組み合わせて進めない
          }
        }

        this._movablelist.push([fr, to, pip, diceodr]);
      }
    }
  }

  _makeDicePipList() {
    let piplist = [];
    let w = 0;
    for (const d of this._usable_dice) {
      w += d;
      if (!piplist.includes(d)) { piplist.push(d); }
      if (!piplist.includes(w)) { piplist.push(w); }
    }
    return piplist.sort((a, b) => a - b);
  }

  _existBacker(f) {
    for (let q = f+1; q <= this.pointmax; q++) {
      if (this.existMyChequer(q)) { return true; }
    }
    return false;
  }

  movablePoint(fr) {
    //frの駒が進めるポイントをリストで返す
    let movable = [];
    this.makeMovableList();
    for (const movinfo of this._movablelist) {
      if (fr != movinfo[0]) { continue; } //動かすポイントでない場合はスキップ
      movable.push(movinfo[1]);
    }
    return movable;
  }

  moveFinished() {
    if (this._usable_dice.length == 0) { return true; } //使える目がなくなった時
    for (let q = 1; q <= this.pointmax; q++) {
      if (!this.existMyChequer(q)) { continue; } //自駒のある所から
      const movlist = this.movablePoint(q, true); //動かせる先がまだあれば false
      if (movlist.length != 0) { return false; }
    }
    return true; //全く動かせる先がなければtrue
  }

} //class Ogid
