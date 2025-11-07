// OtokogiGame_class.js
'use strict';

class OtokogiGammon {
  constructor(playernum = 0, pointmax = 6) {
    this.pointmax = pointmax;
    this.playernum = playernum;
    this.board = new OtokogiBoard(this.pointmax);
    this.ogid = null;
    this.player = 0;
    this.shitplayer = 0;
    this.otokogiID = [];
    this.animDelay = 800; //ダイスを揺らす時間
    this.animDelay2 = 1600; //漢気!! のアニメーション時間
    this.gamefinished = true;

    this.setDomNames();
    this.setEventHandler();
    this.setChequerDraggable();
    this.outerDragFlag = false; //駒でない部分をタップしてドラッグを始めたら true
    if (this.playernum == 0) { //プレーヤ数が未定義で起動されたとき
      this.setButtonEnabled(this.cancelbtn, false);
      this.settings.css(this.calcDrawPosition('S', this.settings)); //設定画面の位置決め
      this.showSettingPanelAction();
    } else {
      this.initGameOption();
      this.beginNewGame(); //新規ゲームを始める
    }
  } //end of constructor()

  setDomNames() {
    //button
    this.rollbtn     = $("#rollbtn");
    this.donebtn     = $("#donebtn");
    this.undobtn     = $("#undobtn");
    this.applybtn    = $("#applybtn");
    this.cancelbtn   = $("#cancelbtn");
    this.settingbtn  = $("#settingbtn");
    this.diceAsBtn   = $("#dice1,#dice2");
    this.pointTriangle = $(".point");

    //panel
    this.container   = $("#container");
    this.boardpanel  = $("#board");
    this.doneundo    = $("#doneundo");
    this.youwin      = $("#youwin");
    this.settings    = $("#settings");

    //chequer
    this.chequerall  = $(".chequer");
  }

  setPanelPosition() {
    this.rollbtn .css(this.calcDrawPosition('B', this.rollbtn));
    this.doneundo.css(this.calcDrawPosition('B', this.doneundo));
    this.youwin  .css(this.calcDrawPosition('B', this.youwin));
    this.settings.css(this.calcDrawPosition('S', this.settings));
  }

  setEventHandler() {
    const clickEventType = 'click touchstart'; //(( window.ontouchstart !== null ) ? 'click':'touchstart');
    //Button Click Event
    this.rollbtn.       on(clickEventType, (e) => { e.preventDefault(); this.rollAction(); });
    this.donebtn.       on(clickEventType, (e) => { e.preventDefault(); this.doneAction(); });
    this.undobtn.       on(clickEventType, (e) => { e.preventDefault(); this.undoAction(); });
    this.diceAsBtn.     on(clickEventType, (e) => { e.preventDefault(); this.doneAction(e); });
    this.settingbtn.    on(clickEventType, (e) => { e.preventDefault(); this.showSettingPanelAction(); });
    this.applybtn.      on(clickEventType, (e) => { e.preventDefault(); this.applySettingPanelAction(); });
    this.cancelbtn.     on(clickEventType, (e) => { e.preventDefault(); this.cancelSettingPanelAction(); });
    this.pointTriangle. on('touchstart mousedown', (e) => { e.preventDefault(); this.pointTouchStartAction(e); });
    $(window).          on('resize',       (e) => { e.preventDefault(); this.delaydraw(); }); 
  }

  initGameOption() {
    switch(this.pointmax) {
      case 5:
        this.container.removeClass("pointmax6 pointmax7").addClass("pointmax5");
        break;
      case 7:
        this.container.removeClass("pointmax5 pointmax6").addClass("pointmax7");
        break;
      default:
        this.container.removeClass("pointmax5 pointmax7").addClass("pointmax6");
        break;
    }

    if (this.playernum <= 4) {
      this.container.removeClass("container8").addClass("container4");
    } else {
      this.container.removeClass("container4").addClass("container8");
    }

    this.player = 0;
    this.setPanelPosition();
    this.board.shuffleColor(); //色をシャッフル
    for (let player = 0; player < 8; player++) {
      this.otokogiID[player] = "OGID=" + "-".repeat(this.pointmax) + "D:00:" + player;
    }
    this.redraw();
    this.shitplayer = Math.floor( Math.random() * this.playernum );
console.log("shitplayer", this.shitplayer);
  }

  beginNewGame() {
    this.ogid = new Ogid(this.otokogiID[this.player]);
    const thumboardcolor = (this.player == this.shitplayer) ? "shitcurrent" : "current";
    $("#thumbboard" + this.player).addClass(thumboardcolor);
    this.board.showBoard(this.ogid);
    this.swapChequerDraggable(false);
    this.clearCurrPosition();
    this.hideAllPanel();
    this.rollbtn.show();
    this.gamefinished = false;
  }

  async rollAction() {
console.log("player, shitplayer", this.player, this.shitplayer);
    this.ogid.dice = (this.player == this.shitplayer) ? this.unrandomdice() : this.randomdice();
    this.board.showBoard(this.ogid);
    await this.board.animateDice(this.animDelay);
    this.swapChequerDraggable(true);
    this.setButtonEnabled(this.donebtn, false);
    this.setCurrPosition(this.ogid);
    this.hideAllPanel();
    this.doneundo.show();
  }

  undoAction() {
    //ムーブ前のボードを再表示
    if (this.isEmptyCurrPosition()) { return; }
    const ogidstr = this.getCurrPosition();
    this.ogid = new Ogid(ogidstr);
    this.makeDiceList(this.ogid.dice);
    this.setButtonEnabled(this.donebtn, false);
    this.board.showBoard(this.ogid);
    this.showThumbBoard(this.ogid, this.player);
    this.swapChequerDraggable(true);
  }

  doneAction() {
    if (!this.ogid.moveFinished()) { return; } //動かし終わっていなければ
    if (this.gamefinished) { return; } //ゲームが終わっていれば
    this.ogid.dice = "00";
    this.otokogiID[this.player] = this.ogid.get_ogidstr();
    $("#thumbboard" + this.player).removeClass("current shitcurrent");

    this.player = this.nextPlayer();
    this.beginNewGame();
  }

  bearoffAllAction() {
    this.hideAllPanel();
    this.gamefinished = true;

    const animClass = "faa-tada animated";
    this.youwin.show().addClass(animClass);

    const defer = $.Deferred(); //deferオブジェクトからpromiseを作る
    setTimeout(() => { //待ってアニメーションを止める
      this.youwin.removeClass(animClass);
      defer.resolve();
    }, this.animDelay2);

    return defer.promise();
  }

  nextPlayer() {
    return (this.player + 1 == this.playernum) ? 0 : this.player + 1;
  }

  hideAllPanel() {
    this.rollbtn.hide();
    this.doneundo.hide();
    this.youwin.hide();
  }

  showSettingPanelAction() {
    this.settings.slideDown(); //設定画面を表示
    this.setButtonEnabled(this.settingbtn, false);
  }

  applySettingPanelAction() {
    this.settings.slideUp(); //設定画面を消す
    this.setButtonEnabled(this.cancelbtn, true);
    this.setButtonEnabled(this.settingbtn, true);
    this.playernum = parseInt($("#players").val());
    this.pointmax = parseInt($("#points").val());
    this.initGameOption();
    this.beginNewGame();
  }

  cancelSettingPanelAction() {
    this.settings.slideUp(); //設定画面を消す
    this.setButtonEnabled(this.settingbtn, true);
  }

  setButtonEnabled(button, enable) {
    button.prop("disabled", !enable);
  }

  randomdice() {
    const random = (() => Math.floor( Math.random() * this.pointmax ) + 1);
    const d1 = random();
    const d2 = random();
    const dicestr = String(d1) + String(d2);
    this.makeDiceList(dicestr);
    return dicestr;
  }

  unrandomdice() {
    const random = (() => Math.floor( Math.random() * this.pointmax ) + 1);
    let d1 = random();
    let d2 = random();
    if (d1 != d2) {
      d1 = Math.max(d1, d2);
      d2 = random();
    }
    const dicestr = String(d1) + String(d2);
    this.makeDiceList(dicestr);
    return dicestr;
  }

  makeDiceList(dice) {
    const dice1 = Number(dice.slice(0, 1));
    const dice2 = Number(dice.slice(1, 2));
    if      (dice1 == dice2) { this.dicelist = [dice1, dice1, dice1, dice1]; }
    else if (dice1 <  dice2) { this.dicelist = [dice2, dice1]; } //大きい順
    else                     { this.dicelist = [dice1, dice2]; }
  }

  calcDrawPosition(pos, elem) {
    const p_width = (pos == 'B') ? this.boardpanel.width() : this.container.width();
    const p_height = (pos == 'B') ? this.boardpanel.height() : this.container.height();
    const wx = (p_width - elem.outerWidth(true)) / 2;
    const wy = (p_height - elem.outerHeight(true)) / 2;
    return {left:wx, top:wy};
  }

  clearCurrPosition() {
    this.undoStack = null;
  }

  isEmptyCurrPosition() {
    return (!this.undoStack);
  }

  setCurrPosition(ogid) {
   this.undoStack = ogid.ogidstr;
  }

  getCurrPosition() {
    return this.undoStack;
  }

  showThumbBoard(ogid, player) {
    const thumbboard = this.board.makeThumbBoard(ogid);
    $("#thumbboard" + player).html(thumbboard);
  }

  delaydraw() {
    setTimeout(() => { //resizeイベントの時は$(window).height()が正しい値を返せるように少し待つ
      this.redraw();
    }, 100);
  }

  redraw() {
    this.setPanelPosition();
    this.board.redraw(this.pointmax);
    for (let player = 0; player < 8; player++) {
      const ogid = new Ogid(this.otokogiID[player]);
      this.showThumbBoard(ogid, player);
      $("#thumbboard" + player).removeClass("shitcurrent")
                               .toggleClass("current", player == this.player) //add/delete class
                               .toggle(player < this.playernum); //toggle=show/hide
    }
  }

  setChequerDraggable() {
    //関数内広域変数
    var x;//要素内のクリックされた位置
    var y;
    var dragobj; //ドラッグ中のオブジェクト
    var zidx; //ドラッグ中のオブジェクトのzIndexを保持

    //この関数内の処理は、パフォーマンスのため jQuery Free で記述

    //ドラッグ開始時のコールバック関数
    const evfn_dragstart = ((origevt) => {
      origevt.preventDefault();
      dragobj = origevt.currentTarget; //dragする要素を取得し、広域変数に格納
      if (!dragobj.classList.contains("draggable")) { return; } //draggableでないオブジェクトは無視

      dragobj.classList.add("dragging"); //drag中フラグ(クラス追加/削除で制御)
      zidx = dragobj.style.zIndex;
      dragobj.style.zIndex = 999;

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousedown") ? origevt : origevt.changedTouches[0];

      //要素内の相対座標を取得
      x = event.pageX - dragobj.offsetLeft;
      y = event.pageY - dragobj.offsetTop;

      //イベントハンドラを登録
      document.body.addEventListener("mousemove",  evfn_drag,    {passive:false});
      document.body.addEventListener("mouseleave", evfn_dragend, false);
      dragobj.      addEventListener("mouseup",    evfn_dragend, false);
      document.body.addEventListener("touchmove",  evfn_drag,    {passive:false});
      document.body.addEventListener("touchleave", evfn_dragend, false);
      document.body.addEventListener("touchend",   evfn_dragend, false);

      const position = { //dragStartAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 };
      this.dragStartAction(origevt, position);
    });

    //ドラッグ中のコールバック関数
    const evfn_drag = ((origevt) => {
      origevt.preventDefault(); //フリックしたときに画面を動かさないようにデフォルト動作を抑制

      //マウスイベントとタッチイベントの差異を吸収
      const event = (origevt.type === "mousemove") ? origevt : origevt.changedTouches[0];

      //マウスが動いた場所に要素を動かす
      dragobj.style.top  = event.pageY - y + "px";
      dragobj.style.left = event.pageX - x + "px";
    });

    //ドラッグ終了時のコールバック関数
    const evfn_dragend = ((origevt) => {
      origevt.preventDefault();
      dragobj.classList.remove("dragging"); //drag中フラグを削除
      dragobj.style.zIndex = zidx;

      //イベントハンドラの削除
      document.body.removeEventListener("mousemove",  evfn_drag,    false);
      document.body.removeEventListener("mouseleave", evfn_dragend, false);
      dragobj.      removeEventListener("mouseup",    evfn_dragend, false);
      document.body.removeEventListener("touchmove",  evfn_drag,    false);
      document.body.removeEventListener("touchleave", evfn_dragend, false);
      document.body.removeEventListener("touchend",   evfn_dragend, false);

      const position = { //dragStopAction()に渡すオブジェクトを作る
                   left: dragobj.offsetLeft,
                   top:  dragobj.offsetTop
                 };
      this.dragStopAction(origevt, position);
    });

    //dragできるオブジェクトにdragstartイベントを設定
    for(const elm of this.chequerall) {
      elm.addEventListener("mousedown",  evfn_dragstart, false);
      elm.addEventListener("touchstart", evfn_dragstart, false);
    }
  }

  dragStartAction(event, position) {
    this.dragObject = $(event.currentTarget); //dragStopAction()で使うがここで取り出しておかなければならない
    const id = event.currentTarget.id;
    this.dragStartPt = this.board.getDragStartPoint(id);
    if (!this.outerDragFlag) { this.dragStartPos = position; }
    this.outerDragFlag = false;
    this.flashOnMovablePoint(this.dragStartPt);
  }

  checkDragEndPt(xg, dragstartpt, dragendpt) {
    let endpt = dragendpt;
    let ok = false;

    if (dragstartpt == dragendpt) {
      //同じ位置にドロップ(＝クリック)したときは、ダイスの目を使ったマスに動かす
      //known bug:目を余らせて動かしたときに、次のコマがクリックで動かせないことがある
      //ex. ベアオフで、54の目で4ptを先にクリックでベアオフすると、5ptのコマはクリックでベアオフできない
      for (let i = 0; i < this.dicelist.length; i++) {
        const endptwk = Math.max(dragstartpt - this.dicelist[i], 0);
        if (xg.isMovable(dragstartpt, endptwk)) {
          this.dicelist.splice(i, 1);
          endpt = endptwk;
          ok = true;
          break;
        }
      }
    } else {
      if (true) {
        //ドロップされた位置が前後 1pt の範囲であれば OK とする。せっかちな操作に対応
        const ok0 = xg.isMovable(dragstartpt, dragendpt);
        const ok1 = xg.isMovable(dragstartpt, dragendpt + 1);
        const ok2 = xg.isMovable(dragstartpt, dragendpt - 1);
        if      (ok0)         { endpt = dragendpt;     ok = true; } //ちょうどの目にドロップ
        else if (ok1 && !ok2) { endpt = dragendpt + 1; ok = true; } //前後が移動可能な時は進めない
        else if (ok2 && !ok1) { endpt = dragendpt - 1; ok = true; } //ex.24の目で3にドロップしたときは進めない
      } else {
        //イリーガルムーブを許可したとき
        endpt = dragendpt;
        ok = true;
      }
      //D&Dで動かした後クリックで動かせるようにダイスリストを調整しておく
      //known bug:ダイス組み合わせの位置に動かしたときは、次のクリックムーブが正しく動かないことがある
      for (let i = 0; i < this.dicelist.length; i++) {
        if (this.dicelist[i] == (dragstartpt - endpt)) {
          this.dicelist.splice(i, 1);
          break;
        }
      }
    }
    return [endpt, ok];
  }

  dragStopAction(event, position) {
    this.flashOffMovablePoint();
    const dragendpt = this.board.getDragEndPoint(position);

    let ok;
    [this.dragEndPt, ok] = this.checkDragEndPt(this.ogid, this.dragStartPt, dragendpt);

    if (ok) {
      this.ogid = this.ogid.moveChequer(this.dragStartPt, this.dragEndPt);
      this.board.showBoard(this.ogid);
      this.showThumbBoard(this.ogid, this.player);
    } else {
      this.dragObject.animate(this.dragStartPos, 300); //元の位置に戻す
    }
    this.swapChequerDraggable(true);
    this.setButtonEnabled(this.donebtn, this.ogid.moveFinished()); //動かし終わるとDoneボタンを押せる
    if (this.ogid.isBearoffAll()) {
      this.bearoffAllAction();
    }
  }

  swapChequerDraggable(enable) {
    this.chequerall.removeClass("draggable");
    if (!enable) { return; }
    for (let n = 0; n < 4; n++) {
      const pt = this.board.chequer[n].point;
      if (pt == 0) { continue; }
      this.board.chequer[n].dom.addClass("draggable");
    }
  }

  flashOnMovablePoint(startpt) {
    const destpt = this.ogid.movablePoint(startpt);
    this.board.flashOnMovablePoint(destpt);
  }

  flashOffMovablePoint() {
    this.board.flashOffMovablePoint();
  }

  pointTouchStartAction(origevt) {
    const id = origevt.currentTarget.id;
    const pt = parseInt(id.substring(2));
    const chker = this.board.getChequerOnDragging(pt);
    const evttypeflg = (origevt.type === "mousedown")
    const event = (evttypeflg) ? origevt : origevt.changedTouches[0];

    if (chker) { //chker may be undefined
      const chkerdom = chker.dom;
      if (chkerdom.hasClass("draggable")) {
        this.outerDragFlag = true;
        this.dragStartPos = {left: chkerdom[0].style.left,
                             top:  chkerdom[0].style.top };
        const offset = this.board.pieceWidth / 2; //チェッカーの真ん中をつかむ
        chkerdom.css({left: event.clientX - offset,
                      top:  event.clientY - offset});
        let delegateEvent;
        if (evttypeflg) {
          delegateEvent = new MouseEvent("mousedown", {clientX:event.clientX, clientY:event.clientY});
        } else {
          const touchobj = new Touch({identifier: 12345,
                                      target: chkerdom[0],
                                      clientX: event.clientX,
                                      clientY: event.clientY,
                                      pageX: event.pageX,
                                      pageY: event.pageY});
          delegateEvent = new TouchEvent("touchstart", {changedTouches:[touchobj]});
        }
        chkerdom[0].dispatchEvent(delegateEvent);
      }
    }
  }

  //UserAgentを確認し、iOSか否かを判断する
  isIOS() {
    const ua = window.navigator.userAgent.toLowerCase();
    return (ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1 || ua.indexOf('ipad') !== -1);
  }

} //end of class OtokogiGammon
