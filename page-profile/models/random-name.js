function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
class RandomName {
  constructor() {
    this.initAnonymousAvatarList =
    [
            "cdn.honghu.com/avatar/anonymous/anonymous1.png",
            "cdn.honghu.com/avatar/anonymous/anonymous2.png",
            "cdn.honghu.com/avatar/anonymous/anonymous3.png",
            "cdn.honghu.com/avatar/anonymous/anonymous4.png",
            "cdn.honghu.com/avatar/anonymous/anonymous5.png",
            "cdn.honghu.com/avatar/anonymous/anonymous6.png",
            "cdn.honghu.com/avatar/anonymous/anonymous7.png",
            "cdn.honghu.com/avatar/anonymous/anonymous8.png",
            "cdn.honghu.com/avatar/anonymous/anonymous9.png",
    ],
    this.nickHeader = [
      "快乐的",
      "冷静的",
      "醉熏的",
      "潇洒的"
    ];
    this.nickFoot = [
      "音响"
    ];

    this.femaleNameItems = `嘉、琼、桂、娣、叶、璧、璐、娅、琦、晶、妍、茜、秋、珊、媛、艳、瑞、凡、佳`.split("、");
    this.maleNameItems = `涛、昌、进、林、有、坚、和、彪、博、诚、先、敬、震、振、弘`.split("、");
   
    this.familyNameItemsSin = "赵,钱,孙,李,周,吴,屠,公,孙,仲,孙".split(",");
    this.familyNameItemsSur ='辕轩,令狐,钟离,宇文,阳佟,第五,言福'.split(",");
    this.allName = this.femaleNameItems.concat(this.maleNameItems);
    this.familyNameItemsAll = this.familyNameItemsSin.concat(this.familyNameItemsSur)
  }

  getNickHeader() {
    return this.nickHeader[randomNum(0, 331)];
  }
  getNickFoot() {
    return this.nickFoot[randomNum(0, 325)];
  }

  getNickName() {
    return this.getNickHeader() + this.getNickFoot();
  }

  getFamilyName(sur = true) {
    if(sur){

      return this.familyNameItemsAll[randomNum(0, this.familyNameItemsAll.length - 1)];
    }
    else{
      return this.familyNameItemsSin[randomNum(0, this.familyNameItemsSin.length - 1)];
    }
   
  }
  getFemaleName(sur) {
    const r = randomNum(0, 1);
    if (r === 0) {
      return (
        this.getFamilyName(sur) +
        this.femaleNameItems[randomNum(0, this.femaleNameItems.length - 1)] +
        this.femaleNameItems[randomNum(0, this.femaleNameItems.length - 1)]
      );
    } else {
      return (
        this.getFamilyName(sur) +
        this.femaleNameItems[randomNum(0, this.femaleNameItems.length - 1)]
      );
    }
  }
  getMaleName(sur) {
    const r = randomNum(0, 1);
    if (r === 0) {
    return (
      this.getFamilyName(sur) +
      this.maleNameItems[randomNum(0, this.maleNameItems.length - 1)] +
      this.maleNameItems[randomNum(0, this.maleNameItems.length - 1)]
    );
    }else{
      return (
        this.getFamilyName(sur) +
        this.maleNameItems[randomNum(0, this.maleNameItems.length - 1)]
      );
    }
  }
  getName(sur) {
    const r = randomNum(0, 1);
    if (r === 0) {
    return (
      this.getFamilyName(sur) +
      this.allName[randomNum(0, this.allName.length - 1)] +
      this.allName[randomNum(0, this.allName.length - 1)]
    );
    }
    else{
      return (
        this.getFamilyName() +this.allName[randomNum(0, this.allName.length - 1)]
      );
    }
    
  }

  getAnonymousAvatarUrl(){
    return this.initAnonymousAvatarList[randomNum(0, this.initAnonymousAvatarList.length - 1)]
  }
}
let randomName = new RandomName();
export default randomName;

