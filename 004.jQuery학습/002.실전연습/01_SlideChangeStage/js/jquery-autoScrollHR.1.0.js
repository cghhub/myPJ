// 자동스크롤 js - jquery-autoScroll.1.0.js

/*************************** 전역변수구역 ***************************/
// 1.현재 페이지번호
let pno = 0;
// 2.전체 페이지수
const totnum = 7;
// 3.광스크롤 상태변수
let prot_sc = 0; //0-허용, 1-불혀용
// 4.스크롤 애니메이션 시간
const dur_sc = 600;
// 광스크롤금지시간===스크롤애니시간
// 5.스크롤 이징
const easing_sc = "easeInQuad";






$(() => { /////////////////////jqb //////////////////////////////

    /*********************************************************** 
        [자동스크롤 구현]
        1.기능:마우스휠을 위나 아래로 작동시킬때
        페이지가 위나 아래로 자동으로 애니메이션되는 기능

        2.이벤트:마우스휠을 움직일때 발생하는 이벤트는?
        -mousewheel(오리지널 이벤트)->파이어폭스 지원안함!
        -wheel (신규이벤트-벤더사의 웹표준이 아직아님!)
        ->엣지,사파리 지원안함!
        -DOMMouseScroll(파이어폭스 전용이벤트)
        ->결론적으로 모두 한꺼번에 지원하는 이벤트가 없으므로
        mousewheel + DOMMouseScroll 2개를 같이 사용할 것임!

        3.마우스 휠 이벤트와 함수를 연결하는 방법:
        -on(이벤트명,함수)
        ->on메서드로 어떤 이벤트와도 함수를 연결할 수 있다!
        (참고로 bind(이벤트명,함수) 메서드를 사용했었지만
        제이쿼리 버전3부터 지원중담함!)

        4.마우스 휠 이벤트 대상 : 보통 document 에 적요함!
        ->>>>>>> 중요한 업데이트 유의사항!!!!
        document, body, window 객체는 이벤트막기를 할수없다!
        -2019년도에 위에 세가지 중요객체에 대하여 기본기능막기를
        할수 없도록 브라우저 소스가 업데이트 되었는데...이유는?
        모바일에서 에러가 발생하는 문제의 원인으로 지목됨
        본3가지 중요객체에 대하여 e.preventDefault() 또느
        return false 를 사용한 기능막기를 못하도록 하였다!

        예)안되는 케이스
        $(document).on("click",function(e){
            e.preventDefault(); ->에러발생
        })
        $(document).on("click",function(e){
            return false; ->에러발생
        })
        $(document).on("click",function(e){
            e.preventDefault(); ->에러발생
        })

        -> 에러를 우회하는 방법은 window, document, body대신
        내부에 전체를 싸는 부모박스를 하나만들고 이것을 대신사용해
        막기셋팅을 할 수 있다!

    ***********************************************************/

    ///////////////// 자동스크롤 구현 /////////////////////
    $(document).on("mousewheel DOMMouseScroll", function (e) {
        // 기본스크롤 기능막기
        // e.preventDefault();
        // return false;
        // ->대신 css에서 스크롤바를 없애기로 한다!

        // 호출여부확인
        // console.log("스크롤링~");

        ///////// 광스크롤막기 /////////////////////////////
        if (prot_sc) return; //값이 1이면 돌아가!
        prot_sc = 1; //잠금(뒷신호부터 못들어옴!)
        setTimeout(() => prot_sc = 0, dur_sc);
        // 애니메이션시간 후 잠금상태해제!//////////////////
        ////////////////////////////////////////////////////



        // e이벤트 전달변수 처리하기
        e = window.event || e;
        // 뒤에 2가지 값중 유효한

        /********************************************************* 
                1.마우스 휠방향 알아내기!
        *********************************************************/
        // ->페이지를 위로갈지 아래로갈지 결정하기위함!
        // 휠델타값으로 방향을 알아낸다!!
        // e.wheelDelta 는 일반 브라우저용 방향정보
        // e.detail은 파이어폭스용 방향정보
        let delta = e.wheelDelta || e.detail;
        // 변수 = 속성값1 || 속성값2
        // -> 두가지 속성중 true 인것을 변수에 할당함!
        // console.log("휠델타값:", delta);

        /******************************************************* 
            1.5. 파이어폭스는 방향부호가 반대임!
            방법:JS 내장함수 test()를 사용하여
            브라우저 정보를 읽어오는
            navigator.userAgent를 사용!
            브라우저 정보안에 "Firefox"라는 정보가
            있으면 test()에서 true를 리턴함!
            그래서 파이어폭스인지 구분함!

            [test()정규식 메서드]
            정규식.test(값)->값 문자열에 정규식문자가
            있는지 검사하여 있으면 true처리!

            [간단한 정규식 표현기호]
            1.정규식 내용은 따옴표를 쓰지 않고 슬래쉬 사이에 씀
            2.모든 패턴문자열을 찾을때는 g라는 플래그문자를 씀
            3.대소문자 구분없이 찾을때는 i라는 플래그문자를 씀
            예)
            /,/g -> 모든 콤마를 찾아라
            /firefox/i -> 대소문자관계없이 'firefox'를 찾아라
            /my/gi -> 대소문자관계없이 'my'문자를 모두 찾아라
        *******************************************************/
        // console.log("브라우저 정보:",navigator.userAgent);
        // console.log("정보여부:",
        // /firefox/i.test(navigator.userAgent));

        // 파이어폭스 브라우저이면 델타값 부호를 반대로 한다!
        if (/firefox/i.test(navigator.userAgent)) {
            delta = -delta; // 변수앞에 마이너스는 부호반대
        } ////////////// if ////////////////////////

        /****************************************************** 
            2.방향에 따른 페이지번호 증감하기
        ******************************************************/
        if (delta < 0) { //음수면 스크롤 아랫방향(다음페이지)
            pno++;
            if (pno === totnum) pno = totnum - 1; //끝번호고정!
        } /////////////////if/////////////////
        else { //양수면 스크롤 윗방향(이전페이지)
            pno--;
            if (pno === -1) pno = 0; //첫번호에 고정!
        } /////////////////else////////////////
        console.log("페이지번호:", pno);

        /****************************************************** 
             3.페이지 높이값에 곱하여 스크롤 이동하기
        ******************************************************/
        // 이동할 위치 -> 페이지가로값*페이지번호
        let pos = $(window).width() * pno;
        $("html,body").stop().animate({
            scrollLeft: pos + "px"
        }, dur_sc, easing_sc);

        // 애니메이션이 큐(Queue)에 쌍이는 것을 지우는것이
        // stop()메서드임!->맨마지막 것만 남음!

        /******************************************************* 
            4.클릭된 페이지와 같은 순번의 GNB li의 클래스on넣기
        *******************************************************/
        // -> CSS셋팅에 현재위치 표시자
        $(".gnb li").eq(pno) // 페이지번호와 같은순번 li
            .addClass("on") // .클래스넣기("on")
            .siblings() // 현재li이외의 다른 형제 li들선택
            .removeClass("on"); // .클래스제거("on")
        $(".indic li").eq(pno) // 페이지번호와 같은순번 li
            .addClass("on") // .클래스넣기("on")
            .siblings() // 현재li이외의 다른 형제 li들선택
            .removeClass("on"); // .클래스제거("on")

    }); //////////// mousewheel ///////////////////////////////



}); /////////////////////////jqb ///////////////////////////////
///////////////////////////////////////////////////////////////