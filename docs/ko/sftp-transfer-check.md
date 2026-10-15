# Mac SFTP 업로드 후 파일과 저장 경로 확인하기

Nexus Shell 팀 · 2026년 10월 15일 · [English](../sftp-transfer-check.md) · [中文](../zh-CN/sftp-transfer-check.md) · [日本語](../ja/sftp-transfer-check.md)

SFTP에 접속했거나 전송 완료 표시를 봤다고 해서 원하는 경로에 올바른 파일이 저장됐다고 단정할 수는 없습니다. 먼저 본인에게 쓰기 권한이 있는 새 테스트 디렉터리로 작은 파일을 올린 뒤, Mac의 **다른 빈 폴더**로 내려받아 원본과 비교하세요. 이 점검은 다른 SFTP 클라이언트에서도 가능하며 제품 구매가 필요하지 않습니다.

## Mac 폴더와 서버 폴더 구분하기

| 확인할 위치 | OpenSSH의 `sftp>` 안에서 사용하는 명령 | GUI에서 확인할 곳 |
| --- | --- | --- |
| 서버의 현재 위치 | `pwd`, `ls` | 원격 경로와 파일 목록 |
| Mac의 현재 위치 | `lpwd`, `lls` | 로컬 경로와 파일 목록 |
| 서버 폴더로 이동 | `cd` | 원격 폴더 |
| Mac 폴더로 이동 | `lcd` | 로컬 폴더 |

위 명령은 SFTP 세션 안에서 사용합니다. Mac Terminal의 일반 shell과 혼동하지 마세요. 상대 경로는 각 쪽의 현재 위치를 기준으로 해석됩니다. 제한된 SFTP 계정의 `/`가 서버 전체의 `/`를 뜻하지 않을 수도 있습니다. 호스팅 업체가 지정한 업로드 경로를 확인하고 웹 주소를 그대로 파일 경로로 바꾸지 마세요.

호스트·포트·사용자 이름·원격 경로를 함께 확인하세요. 연결 이름이나 같은 파일 이름만으로는 목적지를 확인할 수 없습니다. Linux 파일 이름은 대소문자도 구분합니다. 호스트 키 지문이 달라졌다면 관리자나 제공업체를 통해 별도로 확인한 뒤 진행하세요.

## 무료 테스트 파일 다섯 개로 왕복 전송하기

[기존 테스트 ZIP 받기](https://nexusshell.app/assets/downloads/sftp-transfer-check.zip). 공백이 있는 이름, 중국어 이름과 UTF-8 텍스트, 숨김 파일, 빈 파일, 바이너리 파일을 포함한 합성 데이터입니다. 설치 프로그램·비밀번호·개인 키·실행 스크립트는 없습니다. 테스트 데이터는 CC0-1.0입니다. ZIP 안의 설명은 영어·중국어이며 이 문서가 한국어 사용 절차입니다.

ZIP SHA-256: `8fb01dafb0893b5edad5b84929db8731a9d8f94bf42ac65d0acde9818786b544`. 10월 4일 공개한 동일한 파일이며 새 테스트 패키지가 아닙니다. 한글 파일 이름의 모든 인코딩·정규화 조합을 검증하는 패키지도 아닙니다.

1. Mac의 새 폴더에 압축을 풀고 원본을 보관합니다.
2. 서버에서 본인 계정이 소유하고 쓸 수 있는 새 테스트 디렉터리를 선택합니다. 호스트와 전체 경로를 확인하고 숨김 파일을 포함해 전송합니다. 서비스 디렉터리나 기존 파일을 덮어쓰지 마세요.
3. 서버의 테스트 파일을 Mac의 **별도 빈 폴더**로 내려받습니다. 원본 폴더와 섞으면 내려받지 못한 파일이 남아 있는 원본으로 가려질 수 있습니다.
4. 내려받은 `SHA256SUMS`가 보관한 원본과 같은지 먼저 확인합니다. Mac Terminal에서 `cd`와 공백을 입력하고 내려받은 폴더를 끌어 넣은 뒤 Return을 누릅니다. 그 폴더에서 실행하세요.

   ```sh
   shasum -a 256 -c SHA256SUMS
   ```

   다섯 파일이 모두 `OK`이고 종료 상태가 0인지 확인합니다. 내려받은 파일로 새 기준 해시를 만들면 원본과의 비교가 되지 않습니다.
5. 권한·소유자·서비스의 설정 검사는 별도로 진행합니다. 정리할 때는 본인이 만든 테스트 사본만 대상으로 합니다.

검증 명령은 Mac에서 실행하므로 서버 shell이 없는 SFTP 전용 계정에서도 사용할 수 있습니다. 다만 실제 전송 계정의 권한은 필요합니다.

## Terminal 대신 브라우저에서 검사하려면

[기존 브라우저 파일 검사기(영문 UI)](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check)에서 **내려받은 사본**의 데이터 파일 다섯 개를 선택하세요. Mac 파일 선택 창에서 Command + Shift + .을 누르면 숨김 파일을 표시할 수 있습니다. 실제 업무 파일은 선택하지 마세요.

고정된 원본 해시와 비교해 누락·내용 변경·중복 이름·읽기 실패를 구분합니다. 파일이나 해시를 서버로 전송하지 않습니다. README와 SHA256SUMS 등 검사 대상이 아닌 파일은 별도로 표시합니다. JavaScript를 끈 경우 위 Terminal 절차를 사용하세요.

해시 일치는 선택한 다섯 파일의 바이트가 원본과 같다는 뜻입니다. 권한·소유자·ACL·추가 파일·빈 디렉터리·링크·서버의 신원·대용량 전송·재개 동작을 보증하지 않습니다. [생성 소스와 기존 오프라인 검증 기록(영문)](../sftp-transfer-check.md#reproduce-the-offline-validation)은 공개되어 있습니다. 이번 번역은 Nexus Shell GUI나 실제 VPS의 새로운 호환성 시험이 아닙니다.

## 업로드했는데 웹페이지가 바뀌지 않는다면

서버·계정·경로를 다시 확인하고 원격 파일을 별도로 내려받아 내용을 비교하세요. 원격 파일까지 바뀌었다면 서비스가 읽는 경로, 문서 루트, 설정 로딩 또는 캐시를 따로 확인합니다. **전송 성공과 서비스 반영은 다른 단계**입니다. 원인을 확인하기 전에 서비스를 재시작할 필요는 없습니다.

외부 에디터에서 저장한 경우에는 로컬 임시 사본 저장과 업로드도 구분해야 합니다. 다른 경로로 Save As한 파일은 같은 편집 세션이 아닐 수 있습니다. 아직 동기화되지 않은 내용을 먼저 별도로 보관하고 [저장·업로드·서비스 반영 점검(영문)](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#saved-but-not-uploaded)을 확인하세요.

파일은 써도 임시 파일 생성·이름 변경에 필요한 상위 디렉터리 권한이 없어 편집 저장만 실패할 수 있습니다. 별도 SSH에서 실행한 `sudo`는 SFTP 세션을 승격시키지 않습니다. [권한 점검(영문)](../sftp-write-permissions.md)으로 범위를 좁히세요. 웹사이트 / Homebrew판 외부 편집은 원격 shell도 사용하므로 일반 전송과 조건이 다릅니다. App Store판은 다른 전송 엔진을 사용하므로 서버 적합성을 별도로 확인해야 합니다.

## 실제 작업에 맞으면 다음 단계로

[첫 연결과 앱 체험 상태 점검](first-session.md)에서 이어갈 수 있습니다. Nexus Shell의 SFTP에는 Pro 또는 유효한 체험이 필요합니다. 무료 SSH는 개인 비상업용입니다. 대상 웹사이트 신규 계정의 7일 체험은 카드가 필요 없고 종료 시 자동 결제되지 않습니다. 웹사이트 Pro는 평생 이용권만 제공합니다. [웹사이트 가격 확인](https://nexusshell.app/ko/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing).

Apple 구매를 선호하면 [App Store](https://apps.apple.com/kr/app/nexus-shell/id6780150323?mt=12)에 평생 Pro와 자동 갱신 연간 구독이 있습니다. Nexus Shell 계정과 Agent Bridge는 없으며 웹사이트판과 구매·데이터가 별도 관리되고 연결 설정도 자동 이전되지 않습니다. 현재 가격은 다르며 이 문서에서는 새 금액이나 적용일을 발표하지 않습니다.

참고: [OpenSSH sftp 공식 매뉴얼](https://man.openbsd.org/sftp). OpenSSH 설정이 GUI에 자동 적용된다는 뜻은 아닙니다. Nexus Shell은 SFTP를 지원하며 FTP·FTPS·예약 동기화·기업용 MFT의 대체품으로 안내하지 않습니다.
