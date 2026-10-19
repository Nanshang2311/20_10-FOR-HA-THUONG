# A Garden For You

Một món quà tương tác ngày 22.10.2026, dựng bằng React, TypeScript, Vite, GSAP, SVG và Canvas.

## Bắt đầu

```bash
npm install
npm run dev
```

Mở URL Vite hiển thị trong terminal. Build production bằng `npm run build`, xem trước bằng `npm run preview`.

## Nhạc

Đặt bản nhạc bạn có quyền sử dụng tại `public/music/Đô Trưởng - Đạt G - Vpop.mp3`. Nhạc chỉ phát sau thao tác chạm/click. Nếu file chưa có, khu vườn vẫn hoạt động và giao diện hiện hướng dẫn vị trí file.

## Tùy biến lời chúc

Sửa `src/config/wishes.ts` để đổi ngày, câu mở đầu, lời chúc, lời kết và nhãn nút.

## Deploy lên Vercel

Import repository vào Vercel; framework preset Vite, build command `npm run build`, output directory `dist`. Có thể deploy bằng `npx vercel` sau khi cài Vercel CLI và đăng nhập.

## Chuyển động và hỗ trợ

Các cánh hoa SVG bung độc lập theo từng nhịp GSAP; 38 thân cây được sinh theo thứ tự từ tâm ra hai phía. Canvas quản lý hạt sáng, đom đóm và cánh hoa bay bằng một vòng `requestAnimationFrame`. Timeline và event listener được dọn khi component unmount. Tùy chọn `prefers-reduced-motion` được tôn trọng.
