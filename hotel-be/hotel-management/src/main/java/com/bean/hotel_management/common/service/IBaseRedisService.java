package com.bean.hotel_management.common.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface IBaseRedisService {

    // Lưu cặp key, value
    void set(String key, String value);

    // Set thời gian dữ liệu tồn tại trên bộ nhớ cache
    void setTimeToLive(String key, long timeoutInDays);

    // Lưu 3 trường key, value, field
    void hashSet(String key, String field, Object value);

    // Kiểm tra trong redis có tồn tại key đó ko
    boolean hashExists(String key, String field);

    Object get(String key);

    public Map<String, Object> getField(String key);

    Object hashGet(String key, String field);

    List<Object> hashGetByFieldPrefix(String key, String fieldPrefix);

    Set<String> getFieldPrefixes(String key);

    void delete(String key);

    void delete(String key, String field);

    void delete(String key, List<String> fields);
}
