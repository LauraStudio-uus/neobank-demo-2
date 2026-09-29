# NeoBank Demo v2 — Multi-user + Admin

Ứng dụng ngân hàng số mô phỏng chạy hoàn toàn ở trình duyệt bằng HTML/CSS/JavaScript và `localStorage`.

## Tài khoản mặc định

- User: `demo@neobank.vn` / `123456`
- Admin: `admin@neobank.vn` / `admin123`

## Tính năng user

- Dashboard số dư thanh toán + tiết kiệm
- Lịch sử giao dịch
- Chuyển tiền mô phỏng
- Chuyển nội bộ tới tài khoản NeoBank demo nếu số tài khoản tồn tại
- Quản lý thẻ, khóa/mở thẻ
- Tiết kiệm, hồ sơ, dark mode

## Tính năng admin

- Trang **Tài khoản người dùng** riêng
- Xem tất cả tài khoản user
- Tìm kiếm và lọc theo trạng thái
- Tạo tài khoản mới
- Sửa tên, email, số điện thoại, hạng tài khoản, đặt lại mật khẩu
- Chỉnh trực tiếp số dư tài khoản thanh toán và tiết kiệm
- Khóa/mở tài khoản người dùng
- Ghi nhật ký thao tác admin
- Điều chỉnh số dư tự tạo giao dịch để user có thể thấy thay đổi

## Lưu ý bảo mật

Đây là prototype frontend. Mật khẩu và quyền admin đang được mô phỏng bằng `localStorage`, vì vậy **không phù hợp để triển khai ngân hàng thật**. Một hệ thống thật cần backend, database, hash mật khẩu, MFA, session/token an toàn, RBAC phía server, audit log bất biến, mã hóa, rate limiting và kiểm soát giao dịch.

Mở `index.html` bằng trình duyệt để chạy.
