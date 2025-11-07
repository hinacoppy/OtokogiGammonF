// OtokogiChequer_class.js
'use strict';

class Chequer {
  constructor(idx) {
    this._idx = idx;
    this._domid = "pw" + idx;
    const domdiv = '<div id="' + this._domid + '" class="chequer turncolor"></div>';
    this._domhtml = '<div class="border">' + domdiv + '</div>';
    this._dom = null;
    this._point = 0;
  }

  //setter method
  set dom(x)      { this._dom = $("#" + this._domid); } //argument x is dummy
  set point(x)    { this._point = x; }

  //getter method
  get idx()      { return this._idx; }
  get dom()      { return this._dom; }
  get domid()    { return this._domid; }
  get domhtml()  { return this._domhtml; }
  get point()    { return this._point; }

} //class Chequer
