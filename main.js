//
// 定数の定義
//
const RootName = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"];

const Key = {
    Maj : [0, 4, 7],
    min : [0, 3, 7]};

const Duration = {
  "4n" : "1/4",
  "8n" : "1/8",
  "2n" : "1/2",
  "1m" : "1/1"
}
//
// Classの定義
//
class Code {

  constructor(root, keyName) {　//int, [int, ...]
    this.root = root;
    this.keyName = keyName;
    this.key = Key[keyName];
    // console.log(this.root + this.key);
    this.note = [];

    for(var i = 0, l = this.key.length; i < l; i++) {
      this.note.push(Code.scale(root+this.key[i]+keyUp));
    }
  }

  static scale(i) {
    var　degree = i;
    if(i >= 12) {
      degree -= 12;
    }
    var octave = 4 + parseInt((i-3)/12);

    var ret = RootName[degree] + octave;
    return ret;
  }

  name() {
    const keyName = Object.keys(Key).filter( (key) => {
        return Key[key] === this.key;
    })
    return(RootName[this.root]+keyName);
  }
}

class Score {
  constructor() {
    this.list = []; //[何拍分か、何のコードか]のリスト
  }

  addNote(duration, code) {
    this.list.push([duration, code]);
  }

  melodyList() {
    var nodePos = 0;
    var ret = [];
    for(var i=0, l=this.list.length; i<l; i++){
      var bars = parseInt(nodePos/4);
      var count = nodePos - bars*4;

      ret.push({
        'time': bars+":"+count+":0",
        'note': this.list[i][1].note,
        'duration': this.list[i][0]
      });

      nodePos += parseFraction(Duration[ret[i].duration])*4;
    }
    return ret;
  }

  getHTML() {
    var ret = "";
    for(var i=0, l=this.list.length; i<l; i++){
      ret += "<li class='note'>"
      ret += "<span class='duration'>";
      ret += Duration[this.list[i][0]];
      ret += "</span>";
      ret += "<div class='note'>";
      ret += this.list[i][1].name();
      ret += "</div>";
      ret += "</li>";
    }
    return ret;
  }
}

//変調をするための変数
var keyUp = 0;

var addCodeRoot = 0;
var addCodeKeyName = "Maj";
var duration = "4n";

var score = new Score();
var melodyList = [];  //最終的に関数に突っ込む変数

var melody;
var nodePos = 0;

function addNote(){

  //codeの取得
  tmpCode = new Code(addCodeRoot, addCodeKeyName);

  var select = document.querySelector(".duration select");
  duration = document.querySelector(".duration select").value;

  score.addNote(duration, tmpCode);
  melodyList = score.melodyList();

  melody = new Tone.Part(setPlay, melodyList).start();

  //画面に表示
  var codeList = document.getElementById("code_list");
  codeList.innerHTML = score.getHTML();

}

//Initialization
window.onload = function() {

  var Am = new Code(9, "min");
  var FM = new Code(5, "Maj");

  var initialMelodys = [
    Am, FM, Am, FM
  ];

  for(var i = 0; i < 4; i++){
    addCodeRoot = initialMelodys[i].root;
    addCodeKeyName = initialMelodys[i].keyName;
    addNote();
  }

  //Playボタン再生時の処理
  document.querySelector('#play').addEventListener('click', play);

  //コードの追加処理　ルート
  var codeButtons = document.querySelectorAll("#code_generator .root button")
  for(var i = 0; i < codeButtons.length; i++) {
    codeButtons[i].addEventListener('click', function() {

      addCodeRoot = parseInt(this.value);

      document.querySelector("#new_code .root").innerHTML = this.value;
    });
  }

  //コードの追加処理　キー
  var codeButtons = document.querySelectorAll("#code_generator .key button")
  for(var i = 0; i < codeButtons.length; i++) {
    codeButtons[i].addEventListener('click', function() {
      console.log(this.value);
      addCodeKeyName = this.value;
      document.querySelector("#new_code .key").innerHTML = this.value;
    });

  }

  //イベントトラッキング追加　コード追加
  document.querySelector('#code_generator #add').addEventListener('click', addNote);

}

function play() {

  melody = new Tone.Part(setPlay, melodyList).start();
  melody.loop = 4;
  melody.loopEnd = "2m";
  Tone.Transport.bpm.value = 90;
  Tone.Transport.start();
}

var synth = new Tone.PolySynth().toMaster();

function setPlay(time, note) {
  synth.triggerAttackRelease(note.note, note.duration, time);
}

function parseFraction(f) {
  var tmp = f.split("/");
  return parseFloat(parseInt(tmp[0])/parseInt(tmp[1]));
}

function test() {
  var tmp = {a: "1+1"+"は"+"2です"}
}
