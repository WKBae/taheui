자바스크립트 기반 종합 아희 툴킷 Aheui.js
=========================================
[![Test status](https://github.com/WKBae/Aheui.js/actions/workflows/test.yml/badge.svg)](https://github.com/WKBae/Aheui.js/actions/workflows/test.yml)

아희는 [한글로 쓰는 난해한 프로그래밍 언어][aheui]입니다.

이 프로젝트는 아희 사용자의 편의를 위한 기능을 제공하기 위해 시작되었습니다.
기존의 C언어 구현체 [caheui][caheui]는 [큐를 사용할 때 문제가 발생하고](https://www.acmicpc.net/board/view/2827#comment-7875), [자바스크립트 구현체][jsaheui]는 [실행 횟수 변수가](https://github.com/aheui/jsaheui/blob/gh-pages/jsaheui.js#L95) [정수 입력에도 쓰여](https://github.com/aheui/jsaheui/blob/gh-pages/jsaheui.js#L153) "한 단계만" 실행이 정상적으로 진행되지 않았으며 [해당 사이트][webaheui]의 구조에 맞춰져 다른 곳에 사용하기 힘들었습니다.

Aheui.js는 `run()`, `stop()`, `step()`, `reset()` 제어 메소드와 상태(`'start'`, `'step'`, `'stop'`, `'end'`), 동작(`'reset'`), 출력(`'character'`, `'integer'`)과 같은 이벤트 콜백을 두어 이들을 활용해 폭넓은 환경에 적용할 수 있도록 설계되어, 웹 브라우저 뿐 아니라 node.js, Web Worker 등에서도 사용할 수 있습니다. 또한 모듈화를 통해 추후 코드/성능 개선 및 기능 추가도 염두에 두고 있습니다.


컴파일
------

```bash
git clone https://github.com/WKBae/Aheui.js.git
cd Aheui.js
npm install
npm run build
```


문서
----

문서는 아직 준비 중입니다. 그 전까지는 코드의 jsDoc 주석과 [examples/ 폴더](https://github.com/WKBae/Aheui.js/tree/master/examples)의 활용 예를 참고해주시기 바랍니다.


[aheui]: https://aheui.github.io/
[caheui]: https://github.com/aheui/caheui
[jsaheui]: https://github.com/aheui/jsaheui
[webaheui]: http://puzzlet.org/doc/aheui/jsaheui_ko.html