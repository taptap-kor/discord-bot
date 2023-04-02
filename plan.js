// 1. discord.js 뚫기 
// 2. mysql 뚫기
// 3. 이벤트 발생 시 임베드 생성
// 4  MagicEden API 응답 확인
// 5. .me 매크로 추적
// 6. .me [nickname], 
//    .me save [nickname] [link] 에 대응하는 이벤트 발생
// 7. .me 관련 예외처리 및 에러 잡기
// 8. 코인 가격 관련 API 응답 확인
// 9. .coin 매크로 추적 및 원하는 코인 가격 나타나도록 구현

// ===================해결해야할내용====================== //

// 현재 .coin 을 사용시 가격이 USDT로 바꿀수있는 코인의 종류가 얼마 없기에, 해외 API를 끌고와서 USDT를 기본으로 하여 환율 계산하든,
// 한국내에서 사용되는 API중에 KRW는 기본이되 USDT도 범용적으로 등록된 API를 찾아서 이용하기
