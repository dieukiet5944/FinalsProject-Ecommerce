## Pha 1: Request Interceptor (Gắn thẻ bảo mật)
Sơ đồ bắt đầu từ góc trên bên trái. Khi trang Client thực hiện một cuộc gọi API, Request Interceptor sẽ đánh chặn request này. Nó tự động kiểm tra AccessToken trong LocalStorage và gắn nó vào Header (Authorization: Bearer ) trước khi request được gửi đi.

## Pha 2: Server Xử lý (Vòng quay Token)
Khi Server nhận được request, nó sẽ đi qua lớp Middleware để kiểm tra AccessToken.

Nếu Token còn hạn: API Controller sẽ lấy dữ liệu từ DB (vớ dụ: dữ liệu sản phẩm) và trả về kết quả 200.

Nếu Token hết hạn: Server sẽ trả về lỗi 401 Unauthorized.

## Pha 3: Response Interceptor (Đổi mới Token tự động)
Giai đoạn này là cốt lõi của tính năng bảo mật tự động.

Nếu nhận kết quả Success (200): Response Interceptor chỉ việc chuyển dữ liệu về cho Page xử lý.

Nếu nhận lỗi 401: Lúc này, nó sẽ kích hoạt quy trình làm mới Token. Toàn bộ quá trình này (các bước P1 đến P4 trong sơ đồ) diễn ra ngầm. Nó tự động gửi RefreshToken lên endpoint /refresh-token của Server. Server đối chiếu RefreshToken với DB, nếu hợp lệ sẽ trả về AccessToken mới. Client lưu AccessToken mới này, đè nó vào request bị lỗi lúc nãy, và gửi lại lên Server một lần nữa. Người dùng chỉ thấy dữ liệu được tải thành công mà không hề biết một vòng đổi Token phức tạp vừa diễn ra.