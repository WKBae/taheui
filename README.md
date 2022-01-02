타희 taheui - 타입스크립트 아희 인터프리터
=========================================
[![Test status](https://github.com/WKBae/taheui/actions/workflows/test.yml/badge.svg)](https://github.com/WKBae/taheui/actions/workflows/test.yml)
[![Web status](https://github.com/WKBae/taheui/actions/workflows/gh-pages.yml/badge.svg)](https://aheui.bae.sh)

[Example Page](https://aheui.bae.sh)

```bash
npm install --save taheui
```

한글로 쓰는 난해한 프로그래밍 언어 [아희][aheui]의 TypeScript 구현체입니다. 64비트 정수를 제외한 [표준 아희 스니펫][snippets]을 온전하게 지원합니다.

이 프로젝트는 아희 표준을 만족하면서 범용적으로 사용할 수 있는 인터페이스를 제공하는 것을 목표로 합니다.
[jsaheui][jsaheui]의 전역 상태를 피하고, [naheui][naheui]와 비교하면 이벤트, 비동기 실행 기능이 추가되었습니다. 성능도 약간이나마 우세합니다. (logo 기준 15% 빠름)

taheui는 `run()`, `stop()`, `step()`, `reset()` 제어 메소드와 상태(`'start'`, `'step'`, `'stop'`, `'end'`), 동작(`'reset'`), 출력(`'character'`, `'integer'`) 이벤트 콜백으로 구현체를 폭넓은 환경에 적용할 수 있도록 설계되었으며, 호환성도 높여 웹 브라우저 뿐 아니라 node.js, Web Worker와 같은 환경에서도 사용할 수 있습니다.


문서
-----

타입과 주석으로 상세한 설명을 붙이려고 노력했습니다. 별도의 페이지로 마련된 문서는 없지만 코드를 참고해주시기 바랍니다.


컴파일
------

```bash
git clone https://github.com/WKBae/taheui.git
cd taheui
npm install
npm run build
```


[aheui]: https://aheui.github.io/
[snippets]: https://github.com/aheui/snippets
[caheui]: https://github.com/aheui/caheui
[jsaheui]: https://github.com/aheui/jsaheui
[naheui]: https://github.com/aheui/naheui