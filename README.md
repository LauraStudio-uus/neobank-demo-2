# NeoBank Demo v3 — Multi-user + Admin + Multi-session

Ứng dụng ngân hàng số mô phỏng chạy hoàn toàn ở trình duyệt bằng HTML/CSS/JavaScript, `localStorage` và `sessionStorage`.

## Tài khoản mặc định

- User: `demo@neobank.vn` / `123456`
- User 2: `minhanh@neobank.vn` / `123456`
- Admin: `admin@neobank.vn` / `admin123`
- Tài khoản `giahuy@neobank.vn` mặc định đang bị khóa.

## Tính năng nhiều tài khoản hoạt động cùng lúc

- Có thể giữ tối đa **5 tài khoản đăng nhập đồng thời** trong cùng trình duyệt.
- Bấm vào avatar/tên tài khoản ở góc phải hoặc nút **Tài khoản đang mở** trong sidebar để quản lý phiên.
- Chuyển qua lại giữa các tài khoản mà không cần nhập lại mật khẩu.
- Có thể đăng nhập thêm user hoặc admin vào danh sách phiên đang mở.
- Đăng xuất riêng một tài khoản mà các tài khoản còn lại vẫn hoạt động.
- Có nút **Đăng xuất tất cả**.
- Hiển thị bộ đếm `x/5` trên thanh trên cùng, sidebar và dashboard admin.
- Nếu admin khóa một user đang đăng nhập, phiên của user đó trên trình duyệt demo sẽ bị thu hồi.
- Tài khoản bị khóa không thể mở phiên mới.
- Tùy chọn **Ghi nhớ đăng nhập** dùng `localStorage`; phiên không ghi nhớ dùng `sessionStorage`.

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
- Xem user nào đang có phiên đăng nhập trên trình duyệt hiện tại
- Tìm kiếm và lọc theo trạng thái
- Tạo tài khoản mới
- Sửa tên, email, số điện thoại, hạng tài khoản, đặt lại mật khẩu
- Chỉnh trực tiếp số dư tài khoản thanh toán và tiết kiệm
- Khóa/mở tài khoản người dùng
- Ghi nhật ký thao tác admin
- Điều chỉnh số dư tự tạo giao dịch để user có thể thấy thay đổi

## Lưu ý bảo mật

Đây là prototype frontend. Mật khẩu, quyền admin và nhiều phiên đăng nhập đang được mô phỏng phía trình duyệt, vì vậy **không phù hợp để triển khai ngân hàng thật**. Một hệ thống thật cần backend, database, hash mật khẩu, MFA, session/token an toàn, RBAC phía server, audit log bất biến, mã hóa, rate limiting, chống CSRF/XSS và kiểm soát giao dịch.

Mở `index.html` bằng trình duyệt để chạy.
