package com.bean.hotel_management.common.utils;

import com.bean.hotel_management.common.exception.ImageUploadException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileUtils {

    private final Cloudinary cloudinary;

    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"};

    private static final long MAX_FILE_SIZE = 10 *1024*1024;


    // Upload ảnh, trả về URL ảnh đã upload
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        if (file.getOriginalFilename() == null) {
            throw new ImageUploadException("File không được để null");
        }

        FileNameParts fileNameParts = parseFileName(file.getOriginalFilename());
        String publicId = generatePublicId(fileNameParts.name());
        String fullPublicId = buildPublicId(folder, publicId);

        File tempFile = null;
        try {
            tempFile = convertToFile(file, publicId, fileNameParts.extension());
            uploadToCloudinary(tempFile, folder, publicId);
            return generateSecureUrl(fullPublicId);
        } catch (IOException e) {
            log.error("Failed to upload image", e);
            throw new ImageUploadException("Failed to upload image");
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    // Xóa ảnh, trả về true nếu xóa thành công
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return false;
        }

        try {
            String publicId = extractPublicIdFromUrl(imageUrl);
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (Exception e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            return false;
        }
    }

    // Xóa nhiều ảnh, trả về số ảnh đã xóa thành công
    public int deleteImages(Collection<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return 0;
        }

        int deleted = 0;
        for (String url : imageUrls) {
            if (deleteImage(url)) {
                deleted++;
            }
        }

        log.info("Deleted {}/{} images", deleted, imageUrls.size());
        return deleted;
    }

    public boolean isCloudinaryUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return false;
        }
        return imageUrl.contains("cloudinary.com");
    }

    // Validate file trước khi upload
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File vượt quá 5MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        String extension = extractExtension(filename);
        if (!isAllowedExtension(extension)) {
            throw new IllegalArgumentException("Định dạng file không được hỗ trợ");
        }
    }


    // Upload file lên Cloudinary
    private void uploadToCloudinary(File file, String folder, String filename) throws IOException {
        Map<String, Object> params = ObjectUtils.asMap(
                "public_id", filename,
                "folder", folder,
                "resource_type", "auto",
                "quality", "auto:good",
                "fetch_format", "auto",
                "overwrite", false,
                "unique_filename", true
        );

        cloudinary.uploader().upload(file, params);
    }

    // Tạo URL bảo mật cho ảnh
    private String generateSecureUrl(String publicId) {
        return cloudinary.url().secure(true).generate(publicId);
    }

    // Trích xuất publicId từ URL ảnh
    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Tách phần trước dấu "?"
            String cleanUrl = imageUrl.split("\\?")[0];

            // Tìm vị trí của "/upload/"
            int uploadIndex = cleanUrl.indexOf("/upload/");
            if (uploadIndex == -1) {
                throw new IllegalArgumentException("URL không hợp lệ");
            }

            String publicIdWithVersion = cleanUrl.substring(uploadIndex + 8);

            // Thu hồi phiên bản nếu có (ví dụ: v1678901234/)
            publicIdWithVersion = removeVersionPrefix(publicIdWithVersion);

            // Thu hồi phần mở rộng (ví dụ: .jpg, .png)
            publicIdWithVersion = removeFileExtension(publicIdWithVersion);

            return publicIdWithVersion;

        } catch (Exception e) {
            log.error("Cannot extract publicId from url: {}", imageUrl, e);
            throw new IllegalArgumentException("Cannot extract publicId from imageUrl");
        }
    }

    // Loại bỏ tiền tố phiên bản khỏi publicId (v1, v2, ...)
    private String removeVersionPrefix(String publicId) {
        if (publicId.startsWith("v")) {
            int slashIndex = publicId.indexOf("/");
            if (slashIndex > 0) {
                return publicId.substring(slashIndex + 1);
            }
        }
        return publicId;
    }

    // Loại bỏ phần mở rộng khỏi publicId
    private String removeFileExtension(String publicId) {
        int dotIndex = publicId.lastIndexOf(".");
        if (dotIndex > 0) {
            return publicId.substring(0, dotIndex);
        }
        return publicId;
    }

    private File convertToFile(MultipartFile multipartFile, String name, String extension) throws IOException {
        Path tempPath = Files.createTempFile(name, "." + extension);
        try (InputStream is = multipartFile.getInputStream()) {
            Files.copy(is, tempPath, StandardCopyOption.REPLACE_EXISTING);
        }
        return tempPath.toFile();
    }

    // Cleanup file tạm thời sau khi upload
    private void cleanupTempFile(File file) {
        if (file != null && file.exists()) {
            try {
                Files.deleteIfExists(file.toPath());
            } catch (IOException ignored) {}
        }
    }

    // Phân tách tên file và phần mở rộng
    private FileNameParts parseFileName(String filename) {
        int dot = filename.lastIndexOf(".");
        if (dot < 0) throw new IllegalArgumentException("File phải có phần mở rộng");
        return new FileNameParts(
                filename.substring(0, dot),
                filename.substring(dot + 1)
        );
    }

    // Trích xuất phần mở rộng từ tên file
    private String extractExtension(String filename) {
        int dot = filename.lastIndexOf(".");
        return dot > 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }

    private boolean isAllowedExtension(String ext) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equalsIgnoreCase(ext)) return true;
        }
        return false;
    }

    // Tạo publicId duy nhất cho file
    private String generatePublicId(String baseName) {
        return UUID.randomUUID() + "_" +
                baseName.replaceAll("[^a-zA-Z0-9-_]", "_");
    }

    // Xây dựng publicId đầy đủ với folder nếu có
    private String buildPublicId(String folder, String publicId) {
        if (folder == null || folder.isBlank()) return publicId;
        return folder.replaceAll("/+$", "") + "/" + publicId;
    }

    // Ghi đè bản ghi để lưu trữ tên file và phần mở rộng
    private record FileNameParts(String name, String extension) {}
}
