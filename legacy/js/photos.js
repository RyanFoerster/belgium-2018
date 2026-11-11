/* Photo manifest.
   Every slot is filled from Wikimedia Commons (free licences, credited in the colophon).
   To use your own / licensed files, replace `file` with `src: "img/your-file.jpg"`
   and update `by` + `lic`. A slot whose image fails to load falls back to a halftone field. */
(function () {
  var SAD = "Dmitry Sadovnikov / soccer.ru", VEN = "Kirill Venediktov / soccer.ru", BEK = "Svetlana Beketova / soccer.ru",
      BRE = "Edgar Breshchanov / soccer.ru", TAT = "Ministry of Sport of the Republic of Tatarstan", TAS = "Meghdad Madadi / Tasnim News Agency",
      S3 = "CC BY-SA 3.0", S4 = "CC BY-SA 4.0", B4 = "CC BY 4.0";
  var BRA = "Brazil vs Belgium 2018 World Cup ", FRA = "2018 World Cup Semi-Final Match - France, Belgium ";
  window.PHOTOS = {
    /* ── first edition ── */
    team:        { file: "Bel-Tun (2).jpg", w: 1600, by: SAD, lic: S3, alt: "The Belgian team lined up before the match against Tunisia, Moscow, 23 June 2018" },
    hazard:      { file: "Eden Hazard 2018.jpg", w: 500, by: BEK, lic: S3, alt: "Eden Hazard in Belgium's number 10 shirt with the captain's armband" },
    kdb:         { file: "De Bruyne.jpg", w: 500, by: VEN, lic: S3, alt: "Kevin De Bruyne at the 2018 World Cup" },
    lukaku:      { file: "Bel-Tun (7).jpg", w: 500, by: SAD, lic: S3, alt: "Romelu Lukaku during Belgium v Tunisia" },
    courtois:    { file: "Thibaut Courtois at the 2018 World Cup.jpg", w: 500, by: VEN, lic: S3, alt: "Thibaut Courtois at the 2018 World Cup" },
    penalty:     { file: "Eden Hazard penalty.JPG", w: 960, by: "Amarhgil", lic: "Attribution", alt: "Eden Hazard takes the penalty against Tunisia" },
    januzaj:     { file: "Adnan Januzaj scores.jpg", w: 1280, by: VEN, lic: S3, alt: "Adnan Januzaj scores against England in Kaliningrad" },
    japan:       { file: "Belgium - Japan 2018.png", w: 1692, by: VEN, lic: S3, alt: "Belgium v Japan at Rostov Arena, 2 July 2018" },
    brazilTeam:  { file: BRA + "03.jpg", w: 1920, by: TAT, lic: B4, alt: "The Belgian starting eleven before the quarter-final against Brazil in Kazan" },
    brazilAction:{ file: BRA + "16.jpg", w: 1280, by: TAT, lic: B4, alt: "Brazil v Belgium at Kazan Arena, 6 July 2018" },
    france:      { file: FRA + "33 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "Eden Hazard and Kylian Mbappé, France v Belgium, Saint Petersburg, 10 July 2018" },
    third:       { file: "Belgium - England 2018.png", w: 960, by: VEN, lic: S3, alt: "Belgium v England, third-place play-off, 14 July 2018" },
    bronze:      { file: "Eden Hazard Belgium.jpg", w: 500, by: VEN, lic: S3, alt: "Eden Hazard after Belgium won bronze" },

    /* ── the archive box: supporters, stadiums, matchday ── */
    flag:        { file: "Bel-Tun (3).jpg", w: 960, by: SAD, lic: S3, alt: "A giant Belgian flag held on the pitch before Belgium v Tunisia, Moscow" },
    fansMoscow:  { file: "Bel-Tun (16).jpg", w: 960, by: SAD, lic: S3, alt: "Belgian supporters in the stands in Moscow, 23 June 2018" },
    fansOutside: { file: "Bel-Tun (27).jpg", w: 960, by: SAD, lic: S3, alt: "Two supporters with a Belgian flag outside the stadium in Moscow" },
    walk:        { file: "Bel-Tun (28).jpg", w: 960, by: SAD, lic: S3, alt: "The crowd walking to the stadium in Moscow before Belgium v Tunisia" },
    fansKal:     { file: "ENG-BEL (35).jpg", w: 960, by: VEN, lic: S3, alt: "Belgian supporters in red devil hats in Kaliningrad, 28 June 2018" },
    fanCup:      { file: "ENG-BEL (36).jpg", w: 960, by: VEN, lic: S3, alt: "A Belgian supporter holding a replica trophy in Kaliningrad" },
    wall:        { file: "ENG-BEL (12).jpg", w: 1280, by: VEN, lic: S3, alt: "The Belgian end in Kaliningrad, a wall of red shirts" },
    hazardBench: { file: "ENG-BEL (17).jpg", w: 500, by: VEN, lic: S3, alt: "Eden Hazard, rested, watches England v Belgium from the bench" },
    benchKal:    { file: "Januzaj and Hazard.jpg", w: 960, by: VEN, lic: S3, alt: "Belgian players on the bench in Kaliningrad" },
    street:      { file: "2018-07-02 22-04-45 ILCE-6500 DSC01200 DxO (55425635929).jpg", w: 500, by: "Miguel Discart & Kiri Karma", lic: S4, alt: "A supporter holds a Belgium scarf aloft in the street on the evening of Belgium v Japan, 2 July 2018" },
    kontich:     { file: "Football fans at “Gemeenteplein, 2550 Kontich, Province of Antwerp, Kingdom of Belgium” on 6 July 2018, 22.43PM, after the Belgium team had defeated the Brazilan one during the quarter finals of the FIFA World Cup 2018.jpg", w: 960, by: "Vincent Mia Edie Verheyen", lic: S4, alt: "Supporters on the Gemeenteplein in Kontich, Belgium, minutes after the win over Brazil, 6 July 2018" },
    martinez:    { file: BRA + "01.jpg", w: 960, by: TAT, lic: B4, alt: "Roberto Martínez and the Belgian bench during the anthems in Kazan" },
    braJoy:      { file: BRA + "24.jpg", w: 960, by: TAT, lic: B4, alt: "A Belgian player celebrates, arms wide, at Kazan Arena" },
    braHug:      { file: BRA + "25.jpg", w: 960, by: TAT, lic: B4, alt: "Belgian players embrace on the pitch in Kazan" },
    braSalute:   { file: BRA + "28.jpg", w: 1280, by: TAT, lic: B4, alt: "The Belgian team salute the crowd at Kazan Arena after the quarter-final" },
    braFan:      { file: BRA + "27.jpg", w: 960, by: TAT, lic: B4, alt: "A Belgian supporter lifts a replica trophy in the stands in Kazan" },
    braSad:      { file: BRA + "23.jpg", w: 960, by: TAT, lic: B4, alt: "A Brazil supporter with his hands on his head at Kazan Arena" },
    kdbJoy:      { file: "Kevin De Bruyne celebrating Belgium's 2–1 win over Brazil.jpg", w: 1280, by: BRE, lic: S3, alt: "Kevin De Bruyne celebrating Belgium's 2–1 win over Brazil" },
    boot:        { file: FRA + "4 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "A Belgian boot on the match ball, France v Belgium" },
    stadiumSP:   { file: FRA + "10 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "Saint Petersburg Stadium during the anthems before France v Belgium" },
    fanWig:      { file: FRA + "16 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "A Belgian supporter in a red and yellow wig at the semi-final" },
    walkOff:     { file: FRA + "22 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "Lukaku, Mertens and Fellaini during the semi-final against France" },
    lloris:      { file: FRA + "29 Tasnim.jpg", w: 800, by: TAS, lic: B4, alt: "Kompany and Lukaku in front of Hugo Lloris's goal" },
    stadium3:    { file: "На матче за третье место ЧМ-2018 Бельгия-Англия 14.07.2018.jpg", w: 1280, by: "Aleksey Churushkin", lic: S4, alt: "Saint Petersburg Stadium before the third-place play-off, 14 July 2018" },
    vertMedal:   { file: "Jan Vertonghen 14 Jul 2018.jpg", w: 500, by: VEN, lic: S3, alt: "Jan Vertonghen with his bronze medal, 14 July 2018" },
    meunierMedal:{ file: "Thomas Meunier.jpg", w: 500, by: VEN, lic: S3, alt: "Thomas Meunier with his bronze medal" },

    /* ── stickers ── */
    witsel:      { file: "Axel Witsel 2018.jpg", w: 500, by: BEK, lic: S3, alt: "Axel Witsel against Japan" },
    vertonghen:  { file: "Jan Vertonghen 2018.jpg", w: 960, by: BEK, lic: S3, alt: "Jan Vertonghen against Japan in Rostov" },
    kdbJapan:    { file: "Kevin De Bruyne.jpg", w: 500, by: BEK, lic: S3, alt: "Kevin De Bruyne on the ball against Japan" },
    meunier:     { file: "Thomas Meunier 2018 2 (cropped).jpg", w: 500, by: BEK, lic: S3, alt: "Thomas Meunier at the 2018 World Cup" },
    mertens:     { file: "Mertens 2018 (cropped).jpg", w: 500, by: VEN, lic: S3, alt: "Dries Mertens at the 2018 World Cup" },
    fellaini:    { file: "Fellaini 2018 2 (cropped).jpg", w: 500, by: VEN, lic: S3, alt: "Marouane Fellaini at the 2018 World Cup" },
    chadli:      { file: "Nacer Chadli 2018.jpg", w: 250, by: BRE, lic: S3, alt: "Nacer Chadli at the 2018 World Cup" },
    kompany:     { file: "Vincent Kompany.jpg", w: 250, by: BEK, lic: S3, alt: "Vincent Kompany at the 2018 World Cup" },
    alderweireld:{ file: "Alderweireld na Copa do Mundo de 2018 (cortado).jpg", w: 330, by: VEN, lic: S3, alt: "Toby Alderweireld at the 2018 World Cup" }
  };
  window.photoSrc = function (p) {
    return p.src || "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(p.file) + "?width=" + (p.w || 960);
  };
  window.photoPage = function (p) {
    return p.page || (p.file ? "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(p.file.replace(/ /g, "_")) : "");
  };
})();
