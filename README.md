자바스크립트 기반 종합 아희 툴킷 Aheui.js
=========================================

아희는 [한글로 쓰는 난해한 프로그래밍 언어][aheui]입니다.

이 프로젝트는 아희 사용자의 편의를 위한 기능을 제공하기 위해 시작되었습니다.
기존의 C언어 구현체 [caheui][caheui]는 [큐를 사용할 때 문제가 발생하고](https://www.acmicpc.net/board/view/2827#comment-7875), [자바스크립트 구현체][jsaheui]는 [실행 횟수 변수가](https://github.com/aheui/jsaheui/blob/gh-pages/jsaheui.js#L95) [정수 입력에도 쓰여](https://github.com/aheui/jsaheui/blob/gh-pages/jsaheui.js#L153) "한 단계만" 실행이 정상적으로 진행되지 않았으며 [해당 사이트][webaheui]의 구조에 맞춰져 다른 곳에 사용하기 힘들었습니다.

Aheui.js는 `run()`, `stop()`, `step()`, `reset()` 제어 메소드와 상태(`'start'`, `'step'`, `'stop'`, `'end'`), 동작(`'reset'`), 출력(`'character'`, `'integer'`)과 같은 이벤트 콜백을 두어 이들을 활용해 폭넓은 환경에 적용할 수 있도록 설계되어, 웹 브라우저 뿐 아니라 node.js, Web Worker 등에서도 사용할 수 있습니다. 또한 모듈화를 통해 추후 코드/성능 개선 및 기능 추가도 염두에 두고 있습니다.


컴파일
------

Aheui.js는 현재 하나의 파일을 모듈 단위로 나누는 작업을 진행 중에 있습니다. 이 파일들은 gulp로 Google Closure Compiler를 거쳐 압축된 한 파일로 만듭니다. 그 과정은 아래와 같습니다.

 * (gulp가 설치되어있지 않은 경우) `npm install gulp -g`로 gulp를 설치합니다.
 * `git clone https://github.com/WKBae/Aheui.js.git`으로 이 리포지터리를 받습니다.
 * `cd Aheui.js`로 받은 디렉토리로 이동합니다.
 * `npm install`을 실행해 의존 모듈들을 받습니다.
 * `gulp compile` 명령으로 컴파일을 시작합니다.
 * 잠시 기다리면 `dist/` 폴더에 `aheui.min.js` 파일이 생성됩니다.
 * ???
 * PROFIT!


문서
----

문서는 아직 준비 중입니다. 그 전까지는 코드의 jsDoc 주석과 [examples/ 폴더](https://github.com/WKBae/Aheui.js/tree/master/examples)의 활용 예를 참고해주시기 바랍니다.


[aheui]: https://aheui.github.io/
[caheui]: https://github.com/aheui/caheui
[jsaheui]: https://github.com/aheui/jsaheui
[webaheui]: http://puzzlet.org/doc/aheui/jsaheui_ko.html