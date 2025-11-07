// OtokogiBoard_class.js
'use strict';

class OtokogiBoard {
  constructor(pointmax = 6) {
    this.pointmax = pointmax;
    this.ogid = new Ogid();
    this.mainBoard = $('#board'); //need to define before bgBoardConfig()
    this.bgBoardConfig();
    this.prepareSvgDice();
    this.boardstyle = ["boardStyle0", "boardStyle1", "boardStyle2", "boardStyle3",
                       "boardStyle4", "boardStyle5", "boardStyle6", "boardStyle7"];
    this.setDomNameAndStyle();
  } //end of constructor()

  prepareSvgDice() {
    this.svgDice = [];
    this.svgDice[0]  = '';
    this.svgDice[1]  = '<svg class="dice-one" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[1] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[1] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[1] += '</svg>';
    this.svgDice[2]  = '<svg class="dice-two" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[2] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[2] += '<circle cx="50" cy="130" r="8" stroke-width="18"/>';
    this.svgDice[2] += '<circle cx="130" cy="50" r="8" stroke-width="18"/>';
    this.svgDice[2] += '</svg>';
    this.svgDice[3]  = '<svg class="dice-three" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[3] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[3] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="132" cy="48" r="8" stroke-width="18" />';
    this.svgDice[3] += '</svg>';
    this.svgDice[4]  = '<svg class="dice-four" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[4] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[4] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '</svg>';
    this.svgDice[5]  = '<svg class="dice-five" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[5] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[5] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '</svg>';
    this.svgDice[6]  = '<svg class="dice-six" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[6] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[6] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '</svg>';
    this.svgDice[7]  = '<svg class="dice-six" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[7] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[7] += '<circle cx="65" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="65" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="40" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="115" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="140" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[7] += '<circle cx="115" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[7] += '</svg>';
  }

  setDomNameAndStyle() {
    let xh;

    //offtray
    xh  = '<div id="offtray" class="offtray"></div>';
    this.mainBoard.append(xh);
    this.offtray = $('#offtray');
    this.offtray.css(this.getPosObjBottom(this.pointX[0], this.offY));

    //point triangles
    this.point = [];
    const pointColorClass = ["pt_dnev", "pt_dnod"];
    for (let p = 1; p <= 7; p++) { //ポイントは7つ用意しておく
      const colfig = (p % 2); //0=under+even, 1=under+odd
      const xh = '<div id="pt' + p + '" class="point ' + pointColorClass[colfig] + '"></div>';
      this.mainBoard.append(xh);
      this.point[p] = $('#pt' + p);
      this.point[p].css(this.getPosObjBottom(this.pointX[p], this.pointY));
    }
    this.pointAll = $(".point");
    this.point[7].hide(); //7ポイントは最初は非表示

    //dice
    xh  = '<div id="dice1" class="dice"></div>';
    xh += '<div id="dice2" class="dice"></div>';
    this.mainBoard.append(xh);
    this.dice1 = $('#dice1');
    this.dice2 = $('#dice2');
    this.dice1.css(this.getPosObjTop(this.dice1X, this.diceY));
    this.dice2.css(this.getPosObjTop(this.dice2X, this.diceY));

    //Chequer
    this.chequer = [];
    for (let n = 0; n < 4; n++) {
      this.chequer[n] = new Chequer(n);
      const xh = this.chequer[n].domhtml;
      this.mainBoard.append(xh);
      this.chequer[n].dom = true;
    }
  }

  makeThumbBoard(ogid) {
    let xh;

    //container
    const player = ogid.player;
    const style = this.boardstyle[parseInt(player)];
    xh = '<div class="' + style + '">';

    //offtray
    const style2 = this.obj2style(this.getPosObjBottom(this.thumbPointX[0], 0));
    xh += '<div class="thumbofftray" style="' + style2 + '"></div>';

    //point triangles
    const pointColorClass = ["pt_dnev", "pt_dnod"];
    for (let p = 1; p <= this.pointmax; p++) {
      const colfig = (p % 2); //0=under+even, 1=under+odd
      const style = this.obj2style(this.getPosObjBottom(this.thumbPointX[p], this.pointY));
      xh += '<div class="thumbpoint ' + pointColorClass[colfig] + '" style="' + style + '"></div>';
    }

    //Chequer
    for (let pt = 0; pt <= this.pointmax; pt++) {
      const num = ogid.get_ptno(pt);
      for (let n = 0; n < num; n++) {
        const ex = this.thumbPointX[pt];
        const ey = n * (pt == 0 ? this.thumbBoffHeight : this.thumbPieceHeight);
        const style = this.obj2style(this.getPosObjBottom(ex, ey));
        const boff = (pt == 0) ? " bearoff" : "";
        xh += '<div class="thumbchecker turncolor' + boff + '" style="' + style + '"></div>';
      }
    }

    //container close
    xh += '</div>';

    return xh;
  }

  showBoard(ogid) {
    this.ogid = ogid;
    this.showPosition(ogid);
    this.showDice(ogid);
    this.changeAppearance(ogid);
  }

  showDice(ogid) {
    const dicestr = ogid.get_dice();
    const d1 = parseInt(dicestr.substr(0, 1));
    const d2 = parseInt(dicestr.substr(1, 1));
    const dicefaceClass = "diceface";
    this.dice1.html(this.svgDice[d1]).toggle(d1 != 0);
    this.dice2.html(this.svgDice[d2]).toggle(d2 != 0);
    this.dice1.children("svg").addClass(dicefaceClass);
    this.dice2.children("svg").addClass(dicefaceClass);
  }

  showPosition(ogid) {
    let checkerid = 0;
    for (let pt = 0; pt <= this.pointmax; pt++) {
      const num = ogid.get_ptno(pt);
      for (let n = 0; n < num; n++) {
        const ex = this.pointX[pt];
        const ey = this.piecefirstY - (n * ((pt == 0) ? this.boffHeight : this.pieceHeight));
        const pos = this.getPosObjTop(ex, ey);
        const zindex = 10 + checkerid;
        this.chequer[checkerid].dom.css(pos).css("z-index", zindex);
        this.chequer[checkerid].dom.toggleClass("bearoff", pt == 0);
        this.chequer[checkerid].point = pt;
        checkerid += 1;
      }
    }
  }

  changeAppearance(ogid) {
    const player = ogid.get_player();
    const boardstyleall = this.boardstyle.join(" ");
    const boardstyle = this.boardstyle[player];
    this.mainBoard.removeClass(boardstyleall).addClass(boardstyle);
  }

  animateDice(msec) {
    const diceanimclass = "faa-shake animated"; //ダイスを揺らすアニメーション
    this.dice1.addClass(diceanimclass);
    this.dice2.addClass(diceanimclass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //msec秒待ってアニメーションを止める
      this.dice1.removeClass(diceanimclass);
      this.dice2.removeClass(diceanimclass);
      defer.resolve();
    }, msec);

    return defer.promise();
  }

  bgBoardConfig() {
    //CSSで定義された数値情報を取得
    const style = getComputedStyle(document.getElementById('container'));
    const boardWidth4Num   = parseFloat(style.getPropertyValue('--boardWidth4Num'));
    const boardWidth8Num   = parseFloat(style.getPropertyValue('--boardWidth8Num'));
    const offtrayMarginNum = parseFloat(style.getPropertyValue('--offtrayMarginNum'));

    //画面(Viewport)の縦横巾を取得
    const viewportwidth  = Math.max($(window).width(), $(window).height()); //横＝長いほう
    const viewportheight = Math.min($(window).width(), $(window).height()); //縦＝短いほう

    //ボード表示のための位置と大きさの定数を計算
    this.mainBoardHeight = this.mainBoard.height();
    this.mainBoardWidth  = this.mainBoard.width();

    //サムネイルボードの大きさの定数を計算
    this.thumbBoardHeight = $("#thumbboard0").height();
    this.thumbBoardWidth  = $("#thumbboard0").width();

    const ptnum = this.pointmax + 1;
    this.pointWidth = this.mainBoardWidth * 0.99 / ptnum; //ポイントの幅を計算
    this.pieceWidth = viewportwidth * (boardWidth8Num / 100) / ptnum; //チェッカーは8人用に固定
    this.pieceHeight = this.pieceWidth;
    this.boffHeight = this.pieceWidth * 0.4; //ベアオフの駒は立てたように表示
    this.offY = offtrayMarginNum;

    this.thumbPointWidth = this.thumbBoardWidth * 0.99 / ptnum;
    this.thumbPieceWidth = this.thumbPointWidth;
    this.thumbPieceHeight = this.thumbPieceWidth;
    this.thumbBoffHeight = this.thumbPieceWidth * 0.4;

    this.pointY = 0;
    this.pointX = [];
    this.thumbPointX = [];
    for (let p = 0; p <= this.pointmax; p++) {
      const px = this.pointmax - p;
      this.pointX[p]      = px * this.pointWidth;
      this.thumbPointX[p] = px * this.thumbPointWidth;
    }

    this.piecefirstY = this.mainBoardHeight - this.pieceHeight; //一番下のコマ位置Y

    this.diceY = this.mainBoardHeight * 0.15;
    this.dice1X = this.pointX[2];
    this.dice2X = (this.pointmax == 5) ? this.pointX[3] : this.pointX[4];
  }

  getPosObjTop(x, y) {
    return {left:x, top:y};
  }

  getPosObjBottom(x, y) {
    return {left:x, bottom:y};
  }

  obj2style(obj) {
    const left = parseFloat(obj.left);
    const top = parseFloat(obj.top);
    const bottom = parseFloat(obj.bottom);
    let style = "";
    style += (isNaN(left)) ?   "" : "left:"   + left   + "px;";
    style += (isNaN(top)) ?    "" : "top:"    + top    + "px;";
    style += (isNaN(bottom)) ? "" : "bottom:" + bottom + "px;";
    return style;
  }

  getDragEndPoint(pos) {
    const px = Math.floor(pos.left / this.pointWidth + 0.5);
    const pt = this.pointmax - px;
    return pt;
  }

  getDragStartPoint(id) {
    const chker = this.chequer.find(elem => elem.domid == id);
    const pt = chker.point;
    return pt;
  }

  getChequerOnDragging(pt) {
    const aryreverse = this.chequer.reverse();
    const chker = aryreverse.find(elem => elem.point == pt); //一番上の(最後の)チェッカーを返す
    return chker;
  }

  flashOnMovablePoint(destpt) {
    for (const dp of destpt) {
      if (dp == 0) { this.offtray.addClass("flash"); }
      else { this.point[dp].addClass("flash"); }
    }
  }

  flashOffMovablePoint() {
    this.pointAll.removeClass("flash");
    this.offtray.removeClass("flash");
  }

  redraw(pointmax) {
    this.pointmax = pointmax;
    this.bgBoardConfig();

    //offtray
    this.offtray.css(this.getPosObjBottom(this.pointX[0], this.offY));
    //point triangles
    for (let p = 1; p <= this.pointmax; p++) {
      this.point[p].show().css(this.getPosObjBottom(this.pointX[p], this.pointY));
    }
    for (let p = this.pointmax + 1; p <= 7; p++) {
      this.point[p].hide();
    }
    //dice
    this.dice1.css(this.getPosObjTop(this.dice1X, this.diceY));
    this.dice2.css(this.getPosObjTop(this.dice2X, this.diceY));

    this.showBoard(this.ogid);
  }

  shuffleColor() {
    this.boardstyle.sort(() => Math.random() - 0.5); //色をシャッフルする
  }

} //class OtokogiBoard
