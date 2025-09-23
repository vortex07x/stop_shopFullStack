package com.example.demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String API_BASE_URL = "https://api.pujakaitem.com/api/products";

    // Simple cache to avoid repeated API calls
    private List<Map<String, Object>> cachedProducts = null;
    private long lastCacheTime = 0;
    private final long CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    public List<Map<String, Object>> getAllProducts() {
        // Check if cache is still valid
        if (cachedProducts != null && (System.currentTimeMillis() - lastCacheTime) < CACHE_DURATION) {
            logger.info("Returning cached products, count: {}", cachedProducts.size());
            return cachedProducts;
        }

        try {
            logger.info("Fetching products from API: {}", API_BASE_URL);
            String response = restTemplate.getForObject(API_BASE_URL, String.class);

            if (response == null || response.trim().isEmpty()) {
                logger.error("Empty response from product API");
                return getMockProducts(); // Return mock data as fallback
            }

            logger.info("Raw API response (first 200 chars): {}",
                    response.length() > 200 ? response.substring(0, 200) + "..." : response);

            List<Map<String, Object>> products = objectMapper.readValue(
                    response,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            if (products == null) {
                logger.error("Products list is null after parsing");
                return getMockProducts();
            }

            logger.info("Successfully parsed {} products from API", products.size());

            // Log sample product structure
            if (!products.isEmpty()) {
                Map<String, Object> sampleProduct = products.get(0);
                logger.info("Sample product keys: {}", sampleProduct.keySet());
                logger.info("Sample product: {}", sampleProduct);
            }

            // Cache the products
            cachedProducts = products;
            lastCacheTime = System.currentTimeMillis();

            return products;
        } catch (Exception e) {
            logger.error("Error fetching products from API: ", e);
            logger.info("Returning mock products as fallback");
            return getMockProducts(); // Return mock data as fallback
        }
    }

    // Mock products for testing when API is not available
    private List<Map<String, Object>> getMockProducts() {
        List<Map<String, Object>> mockProducts = new ArrayList<>();

        // Create some sample products
        Map<String, Object> laptop = new HashMap<>();
        laptop.put("id", "1");
        laptop.put("name", "Gaming Laptop");
        laptop.put("price", 999.99);
        laptop.put("category", "electronics");
        laptop.put("company", "TechBrand");
        laptop.put("description", "High-performance gaming laptop");
        laptop.put("stock", 10);
        mockProducts.add(laptop);

        Map<String, Object> phone = new HashMap<>();
        phone.put("id", "2");
        phone.put("name", "Smartphone");
        phone.put("price", 599.99);
        phone.put("category", "electronics");
        phone.put("company", "PhoneBrand");
        phone.put("description", "Latest smartphone with great camera");
        phone.put("stock", 15);
        mockProducts.add(phone);

        Map<String, Object> book = new HashMap<>();
        book.put("id", "3");
        book.put("name", "Programming Guide");
        book.put("price", 29.99);
        book.put("category", "books");
        book.put("company", "BookPublisher");
        book.put("description", "Complete programming guide for beginners");
        book.put("stock", 50);
        mockProducts.add(book);

        logger.info("Created {} mock products for testing", mockProducts.size());
        return mockProducts;
    }

    public Map<String, Object> getProductById(String id) {
        try {
            logger.info("Fetching product by ID: {}", id);
            String response = restTemplate.getForObject(API_BASE_URL + "/" + id, String.class);

            if (response == null) {
                logger.error("Null response for product ID: {}", id);
                return new HashMap<>();
            }

            return objectMapper.readValue(response, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.error("Error fetching product by ID {}: ", id, e);
            return new HashMap<>();
        }
    }

    public List<Map<String, Object>> searchProducts(String searchTerm) {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Searching for '{}' in {} products", searchTerm, allProducts.size());

        if (allProducts.isEmpty()) {
            return new ArrayList<>();
        }

        String lowerSearchTerm = searchTerm.toLowerCase();
        logger.info("Normalized search term: '{}'", lowerSearchTerm);

        List<Map<String, Object>> results = allProducts.stream()
                .filter(product -> {
                    String name = getStringValue(product, "name").toLowerCase();
                    String description = getStringValue(product, "description").toLowerCase();
                    String category = getStringValue(product, "category").toLowerCase();
                    String company = getStringValue(product, "company").toLowerCase();

                    boolean matches = name.contains(lowerSearchTerm) ||
                            description.contains(lowerSearchTerm) ||
                            category.contains(lowerSearchTerm) ||
                            company.contains(lowerSearchTerm);

                    if (matches) {
                        logger.debug("Product '{}' matches search term '{}'", name, lowerSearchTerm);
                    }

                    return matches;
                })
                .collect(Collectors.toList());

        logger.info("Search for '{}' returned {} results", searchTerm, results.size());
        return results;
    }

    public List<Map<String, Object>> getProductsByCategory(String category) {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Getting products by category '{}' from {} products", category, allProducts.size());

        if (allProducts.isEmpty()) {
            return new ArrayList<>();
        }

        String lowerCategory = category.toLowerCase();

        List<Map<String, Object>> results = allProducts.stream()
                .filter(product -> {
                    String productCategory = getStringValue(product, "category").toLowerCase();
                    return productCategory.contains(lowerCategory);
                })
                .collect(Collectors.toList());

        logger.info("Category '{}' returned {} results", category, results.size());
        return results;
    }

    public List<Map<String, Object>> getAvailableProducts() {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Getting available products from {} total products", allProducts.size());

        if (allProducts.isEmpty()) {
            return new ArrayList<>();
        }

        return allProducts.stream()
                .filter(product -> {
                    Object stockObj = product.get("stock");
                    if (stockObj != null) {
                        Integer stock = getIntegerValue(product, "stock");
                        return stock != null && stock > 0;
                    }
                    return true; // If no stock info, assume available
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLatestProducts(int limit) {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Getting {} latest products from {} total products", limit, allProducts.size());

        if (allProducts.isEmpty()) {
            return new ArrayList<>();
        }

        return allProducts.stream()
                .sorted((p1, p2) -> {
                    String id1 = getStringValue(p1, "id");
                    String id2 = getStringValue(p2, "id");

                    try {
                        Integer intId1 = Integer.parseInt(id1);
                        Integer intId2 = Integer.parseInt(id2);
                        return intId2.compareTo(intId1);
                    } catch (NumberFormatException e) {
                        return id2.compareTo(id1);
                    }
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Getting products in price range ${} - ${}", minPrice, maxPrice);

        if (allProducts.isEmpty()) {
            return new ArrayList<>();
        }

        return allProducts.stream()
                .filter(product -> {
                    Double price = getDoubleValue(product, "price");
                    return price != null && price >= minPrice && price <= maxPrice;
                })
                .collect(Collectors.toList());
    }

    public List<String> getAvailableCategories() {
        List<Map<String, Object>> allProducts = getAllProducts();
        logger.info("Getting available categories from {} products", allProducts.size());

        if (allProducts.isEmpty()) {
            return Arrays.asList("electronics", "books", "clothing"); // Default categories
        }

        List<String> categories = allProducts.stream()
                .map(product -> getStringValue(product, "category"))
                .filter(category -> !category.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        logger.info("Found categories: {}", categories);
        return categories;
    }

    // Helper methods to safely extract values from API response
    private String getStringValue(Map<String, Object> product, String key) {
        Object value = product.get(key);
        return value != null ? value.toString() : "";
    }

    private Integer getIntegerValue(Map<String, Object> product, String key) {
        Object value = product.get(key);
        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        } else if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }

    private Double getDoubleValue(Map<String, Object> product, String key) {
        Object value = product.get(key);
        if (value instanceof Double) {
            return (Double) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        } else if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        } else if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return null;
    }
}