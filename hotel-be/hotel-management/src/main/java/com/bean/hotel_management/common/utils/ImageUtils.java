package com.bean.hotel_management.common.utils;

import com.bean.hotel_management.common.config.ImageUploadProperties;
import com.bean.hotel_management.common.exception.ImageUploadException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageUtils {

    private final FileUtils fileUtils;
    private final ImageUploadProperties imageUploadProperties;

    public String uploadImage(MultipartFile imageFile, String folderUrl) {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        try {
            String fullFolder = buildFullFolderPath(folderUrl);
            String imageUrl = fileUtils.uploadImage(imageFile, fullFolder);
            log.info("Image uploaded successfully: {}", imageFile.getOriginalFilename());
            return imageUrl;
        } catch (Exception e) {
            log.error("Failed to upload image: {}", imageFile.getOriginalFilename(), e);
            throw new ImageUploadException("Không thể upload ảnh: " + imageFile.getOriginalFilename());
        }
    }


    public List<String> uploadListImages(List<MultipartFile> files, String folderUrl) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> uploadedUrls = new ArrayList<>();
        List<String> failedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            try {
                String imageUrl = uploadImage(file, folderUrl);
                if (imageUrl != null) {
                    uploadedUrls.add(imageUrl);
                }
            } catch (Exception e) {
                failedFiles.add(file.getOriginalFilename());
                log.error("Failed to upload: {}", file.getOriginalFilename(), e);
            }
        }

        if (!failedFiles.isEmpty()) {
            log.warn("Failed to upload {} files: {}", failedFiles.size(), failedFiles);
        }

        return uploadedUrls;
    }

    public String uploadImageWithFallback(MultipartFile imageFile, List<String> existingImages, String folderUrl) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                return uploadImage(imageFile, folderUrl);
            } catch (Exception e) {
                log.warn("Upload failed, using fallback: {}", e.getMessage());
            }
        }

        // Fallback to first existing image
        if (existingImages != null && !existingImages.isEmpty()) {
            return existingImages.get(0);
        }

        return null;
    }

    /**
     * Xóa 1 ảnh khỏi Cloudinary
     * @param imageUrl URL ảnh cần xóa
     * @return true nếu xóa thành công
     */
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return false;
        }

        if (!fileUtils.isCloudinaryUrl(imageUrl)) {
            log.warn("Not a Cloudinary URL, skipping delete: {}", imageUrl);
            return false;
        }

        boolean deleted = fileUtils.deleteImage(imageUrl);
        if (deleted) {
            log.info("Image deleted from Cloudinary: {}", imageUrl);
        } else {
            log.warn("Failed to delete image from Cloudinary: {}", imageUrl);
        }

        return deleted;
    }

    /**
     * Xóa nhiều ảnh
     * @param imageUrls Danh sách URL
     * @return Số lượng ảnh đã xóa thành công
     */
    public int deleteMultipleImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return 0;
        }

        int deletedCount = 0;
        for (String imageUrl : imageUrls) {
            if (deleteImage(imageUrl)) {
                deletedCount++;
            }
        }

        log.info("Deleted {}/{} images from Cloudinary", deletedCount, imageUrls.size());
        return deletedCount;
    }

    /**
     * Xóa tất cả ảnh của phòng (images + thumbnail)
     * Chỉ xóa ảnh unique (không trùng lặp)
     */
    public void deleteAllRoomImages(List<String> images, String thumbnailImage) {
        List<String> uniqueImages = new ArrayList<>();

        // Add all images
        if (images != null) {
            uniqueImages.addAll(images);
        }

        // Add thumbnail if it's not already in the list
        if (thumbnailImage != null && !uniqueImages.contains(thumbnailImage)) {
            uniqueImages.add(thumbnailImage);
        }

        if (!uniqueImages.isEmpty()) {
            int deleted = deleteMultipleImages(uniqueImages);
            log.info("Deleted {}/{} room images", deleted, uniqueImages.size());
        }
    }


    /**
     * Upload ảnh mới và xóa ảnh cũ
     * @param newImageFile File ảnh mới
     * @param oldImageUrl URL ảnh cũ
     * @param folderUrl Folder đích
     * @return URL ảnh mới
     */
    public String replaceImage(MultipartFile newImageFile, String oldImageUrl, String folderUrl) {
        // Upload ảnh mới trước
        String newImageUrl = uploadImage(newImageFile, folderUrl);

        // Xóa ảnh cũ nếu upload thành công và ảnh cũ khác ảnh mới
        if (newImageUrl != null && oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            deleteImage(oldImageUrl);
        }

        return newImageUrl;
    }

    /**
     * Thay thế nhiều ảnh
     * @param newImageFiles Danh sách file mới
     * @param oldImageUrls Danh sách URL cũ cần xóa
     * @param folderUrl Folder đích
     * @return Danh sách URL mới
     */
    public List<String> replaceMultipleImages(List<MultipartFile> newImageFiles,
                                              List<String> oldImageUrls,
                                              String folderUrl) {
        // Upload ảnh mới
        List<String> newImageUrls = uploadListImages(newImageFiles, folderUrl);

        // Xóa ảnh cũ (chỉ những ảnh không còn trong list mới)
        if (oldImageUrls != null && !oldImageUrls.isEmpty()) {
            List<String> imagesToDelete = new ArrayList<>();
            for (String oldUrl : oldImageUrls) {
                if (!newImageUrls.contains(oldUrl)) {
                    imagesToDelete.add(oldUrl);
                }
            }

            if (!imagesToDelete.isEmpty()) {
                deleteMultipleImages(imagesToDelete);
            }
        }

        return newImageUrls;
    }


    // Validate  file ảnh
    public boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    // Validate danh sách file ảnh
    public void validateImageFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Phải upload ít nhất 1 ảnh");
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty() && !isValidImageFile(file)) {
                throw new IllegalArgumentException(
                        "File " + file.getOriginalFilename() + " không phải là ảnh hợp lệ"
                );
            }
        }
    }


    // Build full folder path
    private String buildFullFolderPath(String folderUrl) {
        String baseFolder = imageUploadProperties.getDefaultFolder();
        if (baseFolder == null) {
            baseFolder = "";
        }

        // Remove trailing slash from base folder
        baseFolder = baseFolder.replaceAll("/+$", "");

        // Ensure folderUrl starts with /
        if (!folderUrl.startsWith("/")) {
            folderUrl = "/" + folderUrl;
        }

        return baseFolder + folderUrl;
    }

     // Kiểm tra URL có phải Cloudinary không
    public boolean isCloudinaryUrl(String imageUrl) {
        return fileUtils.isCloudinaryUrl(imageUrl);
    }
}