package com.bean.hotel_management.room.controller;

import com.bean.hotel_management.common.dto.ApiResponse;
import com.bean.hotel_management.room.dto.request.CreateRoomRequest;
import com.bean.hotel_management.room.dto.request.RoomSearchRequest;
import com.bean.hotel_management.room.dto.request.UpdateRoomRequest;
import com.bean.hotel_management.room.dto.response.RoomResponse;
import com.bean.hotel_management.room.dto.response.RoomStatistics;
import com.bean.hotel_management.room.model.RoomStatus;
import com.bean.hotel_management.room.model.RoomType;
import com.bean.hotel_management.room.service.IRoomService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RoomController {

    private final IRoomService roomService;


    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả phòng")
    public ResponseEntity<ApiResponse> getAllRooms(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "false") boolean includeReviews) {

        Page<RoomResponse> rooms = roomService.getAllRooms(page, size, sortBy, sortOrder, includeReviews);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng thành công", rooms));
    }


    @PostMapping("/search")
    @Operation(summary = "Tìm kiếm phòng")
    public ResponseEntity<ApiResponse> searchRooms(
            @Valid @RequestBody RoomSearchRequest request) {

        Page<RoomResponse> rooms = roomService.searchRooms(request);
        return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm phòng thành công", rooms));
    }


    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin phòng theo ID")
    public ResponseEntity<ApiResponse> getRoomById(@PathVariable String id) {
        RoomResponse room = roomService.getRoomById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin phòng thành công", room));
    }


    @GetMapping("/room-number/{roomNumber}")
    @Operation(summary = "Lấy thông tin phòng theo số phòng")
    public ResponseEntity<ApiResponse> getRoomByNumber(@PathVariable String roomNumber) {
        RoomResponse room = roomService.getRoomByRoomNumber(roomNumber);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin phòng thành công", room));
    }


    @GetMapping("/featured")
    @Operation(summary = "Lấy danh sách phòng nổi bật")
    public ResponseEntity<ApiResponse> getFeaturedRooms() {
        List<RoomResponse> rooms = roomService.getFeaturedRooms();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng nổi bật thành công", rooms));
    }


    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách phòng trống")
    public ResponseEntity<ApiResponse> getAvailableRooms() {
        List<RoomResponse> rooms = roomService.getAvailableRooms();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng trống thành công", rooms));
    }


    @GetMapping("/type/{type}")
    @Operation(summary = "Lấy phòng theo loại")
    public ResponseEntity<ApiResponse> getRoomsByType(@PathVariable RoomType type) {
        List<RoomResponse> rooms = roomService.getRoomsByType(type);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng theo loại thành công", rooms));
    }


    @GetMapping("/floor/{floor}")
    @Operation(summary = "Lấy phòng theo tầng")
    public ResponseEntity<ApiResponse> getRoomsByFloor(
            @PathVariable @Min(1) @Max(50) Integer floor) {

        List<RoomResponse> rooms = roomService.getRoomsByFloor(floor);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng theo tầng thành công", rooms));
    }


    @GetMapping("/price-range")
    @Operation(summary = "Lấy phòng theo khoảng giá")
    public ResponseEntity<ApiResponse> getRoomsByPriceRange(
            @RequestParam @Min(0) Double minPrice,
            @RequestParam @Min(0) Double maxPrice) {

        List<RoomResponse> rooms = roomService.getRoomsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng theo giá thành công", rooms));
    }


    @GetMapping("/occupancy/{minOccupancy}")
    @Operation(summary = "Lấy phòng theo sức chứa")
    public ResponseEntity<ApiResponse> getRoomsByOccupancy(
            @PathVariable @Min(1) @Max(10) Integer minOccupancy) {

        List<RoomResponse> rooms = roomService.getRoomsByOccupancy(minOccupancy);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng theo sức chứa thành công", rooms));
    }


    @GetMapping("/check-availability/{roomId}")
    @Operation(summary = "Kiểm tra tình trạng phòng")
    public ResponseEntity<ApiResponse> checkAvailability(@PathVariable String roomId) {
        boolean available = roomService.isRoomAvailable(roomId);
        String message = available ? "Phòng còn trống" : "Phòng không khả dụng";

        return ResponseEntity.ok(ApiResponse.success(message, available));
    }


    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Tạo mới phòng (chỉ staff/admin)")
    public ResponseEntity<ApiResponse> createRoom(
            @Valid @ModelAttribute CreateRoomRequest request,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        RoomResponse room = roomService.createRoom(adminEmail, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng thành công", room));
    }


    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật thông tin phòng")
    public ResponseEntity<ApiResponse> updateRoom(
            @PathVariable String id,
            @Valid @ModelAttribute UpdateRoomRequest request) {

        RoomResponse room = roomService.updateRoom(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật phòng thành công", room));
    }


    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xóa phòng")
    public ResponseEntity<ApiResponse> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(
                ApiResponse.success("Xóa phòng thành công", null));
    }


    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật trạng thái phòng")
    public ResponseEntity<ApiResponse> updateRoomStatus(
            @PathVariable String id,
            @RequestParam RoomStatus status) {

        RoomResponse room = roomService.updateRoomStatus(id, status);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái phòng thành công", room));
    }


    @PatchMapping("/admin/{id}/available")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu phòng còn trống")
    public ResponseEntity<ApiResponse> markAsAvailable(@PathVariable String id) {
        RoomResponse room = roomService.markAsAvailable(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu phòng còn trống", room));
    }


    @PatchMapping("/admin/{id}/occupied")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu phòng đã có khách")
    public ResponseEntity<ApiResponse> markAsOccupied(@PathVariable String id) {
        RoomResponse room = roomService.markAsOccupied(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu phòng đã có khách", room));
    }


    @PatchMapping("/admin/{id}/maintenance")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu phòng đang bảo trì")
    public ResponseEntity<ApiResponse> markAsMaintenance(@PathVariable String id) {
        RoomResponse room = roomService.markAsMaintenance(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu phòng đang bảo trì", room));
    }


    @PatchMapping("/admin/{id}/cleaning")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đánh dấu phòng đang dọn dẹp")
    public ResponseEntity<ApiResponse> markAsCleaning(@PathVariable String id) {
        RoomResponse room = roomService.markAsCleaning(id);
        return ResponseEntity.ok(
                ApiResponse.success("Đánh dấu phòng đang dọn dẹp", room));
    }


    @PatchMapping("/admin/{id}/toggle-featured")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Toggle trạng thái nổi bật của phòng")
    public ResponseEntity<ApiResponse> toggleFeatured(@PathVariable String id) {
        RoomResponse room = roomService.toggleFeatured(id);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái nổi bật", room));
    }


    @PatchMapping("/admin/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Toggle trạng thái hoạt động của phòng")
    public ResponseEntity<ApiResponse> toggleActive(@PathVariable String id) {
        RoomResponse room = roomService.toggleActive(id);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái hoạt động", room));
    }



    @PostMapping("/admin/{id}/images")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thêm ảnh cho phòng")
    public ResponseEntity<ApiResponse> addImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {

        RoomResponse room = roomService.uploadImagesFile(id, files);
        return ResponseEntity.ok(
                ApiResponse.success("Thêm ảnh thành công", room));
    }


    @DeleteMapping("/admin/{id}/images")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xóa ảnh khỏi phòng")
    public ResponseEntity<ApiResponse> removeImage(
            @PathVariable String id,
            @RequestParam String imageUrl) {

        RoomResponse room = roomService.removeImage(id, imageUrl);
        return ResponseEntity.ok(
                ApiResponse.success("Xóa ảnh thành công", room));
    }


    @PatchMapping("/admin/{id}/thumbnail")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đặt ảnh thumbnail cho phòng")
    public ResponseEntity<ApiResponse> setThumbnail(
            @PathVariable String id,
            @RequestParam String imageUrl) {

        RoomResponse room = roomService.setThumbnail(id, imageUrl);
        return ResponseEntity.ok(
                ApiResponse.success("Đặt ảnh thumbnail thành công", room));
    }



    @PostMapping("/admin/{id}/amenities")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Thêm tiện nghi cho phòng")
    public ResponseEntity<ApiResponse> addAmenities(
            @PathVariable String id,
            @RequestBody List<String> amenities) {

        RoomResponse room = roomService.addAmenities(id, amenities);
        return ResponseEntity.ok(
                ApiResponse.success("Thêm tiện nghi thành công", room));
    }


    @DeleteMapping("/admin/{id}/amenities")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xóa tiện nghi khỏi phòng")
    public ResponseEntity<ApiResponse> removeAmenity(
            @PathVariable String id,
            @RequestParam String amenity) {

        RoomResponse room = roomService.removeAmenity(id, amenity);
        return ResponseEntity.ok(
                ApiResponse.success("Xóa tiện nghi thành công", room));
    }



    @PatchMapping("/admin/{id}/price")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật giá phòng")
    public ResponseEntity<ApiResponse> updatePrice(
            @PathVariable String id,
            @RequestParam @Min(100000) Double price) {

        RoomResponse room = roomService.updatePrice(id, price);
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật giá thành công", room));
    }


    @GetMapping("/admin/statistics")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy thống kê phòng")
    public ResponseEntity<ApiResponse> getStatistics() {
        RoomStatistics stats = roomService.getRoomStatistics();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thống kê phòng thành công", stats));
    }


    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy danh sách phòng theo trạng thái")
    public ResponseEntity<ApiResponse> getRoomsByStatus(@PathVariable RoomStatus status) {
        List<RoomResponse> rooms = roomService.getRoomsByStatus(status);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách phòng theo trạng thái thành công", rooms));
    }


    @GetMapping("/admin/count/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đếm số phòng theo trạng thái")
    public ResponseEntity<ApiResponse> countByStatus(@PathVariable RoomStatus status) {
        Long count = roomService.countRoomsByStatus(status);
        return ResponseEntity.ok(
                ApiResponse.success("Đếm số phòng thành công", count));
    }


    @GetMapping("/admin/count/type/{type}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Đếm số phòng theo loại")
    public ResponseEntity<ApiResponse> countByType(@PathVariable RoomType type) {
        Long count = roomService.countRoomsByType(type);
        return ResponseEntity.ok(
                ApiResponse.success("Đếm số phòng thành công", count));
    }


    @GetMapping("/admin/average-price")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Lấy giá trung bình của tất cả phòng")
    public ResponseEntity<ApiResponse> getAveragePrice() {
        Double avgPrice = roomService.getAveragePrice();
        return ResponseEntity.ok(
                ApiResponse.success("Lấy giá trung bình thành công", avgPrice));
    }
}