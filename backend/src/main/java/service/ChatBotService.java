package com.example.demo.service;

import com.example.demo.dto.ChatResponse;
import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ChatBotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatBotService.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderRepository orderRepository;

    // Enhanced keyword patterns for better intent recognition
    private final List<String> greetings = Arrays.asList("hello", "hi", "hey", "good morning", "good evening", "start", "hai");
    private final List<String> orderQueries = Arrays.asList("order", "orders", "my order", "purchase", "bought", "history", "my orders", "order history", "my purchases");
    private final List<String> helpQueries = Arrays.asList("help", "what can you do", "assistance", "support", "menu", "options");

    // Categories that exist in your system (based on your conversation log)
    private final Map<String, String> categoryMap = new HashMap<String, String>() {{
        put("laptop", "laptop");
        put("laptops", "laptop");
        put("mobile", "mobile");
        put("mobiles", "mobile");
        put("phone", "mobile");
        put("phones", "mobile");
        put("smartphone", "mobile");
        put("smartphones", "mobile");
        put("computer", "computer");
        put("computers", "computer");
        put("electronics", "electronics");
        put("electronic", "electronics");
        put("accessories", "accessories");
        put("accessory", "accessories");
        put("tech", "electronics");
        put("technology", "electronics");
    }};

    // Enhanced patterns for better intent recognition
    private final Pattern SHOW_ALL_PRODUCTS_PATTERN = Pattern.compile(
            "(?i)^(show|display|list|view)\\s+(me\\s+)?(all\\s+)?(products?|items?)$|^(products?|items?)$|^(all\\s+)?(products?|items?)$|^(latest\\s+products?)$"
    );

    private final Pattern AVAILABILITY_PATTERN = Pattern.compile(
            "(?i)(what'?s\\s+available|what\\s+is\\s+available|available|in\\s+stock|stock)"
    );

    private final Pattern PRICE_PATTERN = Pattern.compile(
            "(?i)(price\\s+range|pricing|prices|cost)"
    );

    private final Pattern SHOW_PRODUCTS_PATTERN = Pattern.compile(
            "(?i)^show\\s+me\\s+(\\w+)s?$"
    );

    // Stop words to exclude from search terms
    private final Set<String> stopWords = new HashSet<>(Arrays.asList(
            "show", "me", "find", "search", "for", "i", "want", "need", "looking", "can", "you",
            "what", "is", "are", "the", "a", "an", "some", "get", "have", "give", "tell", "about",
            "all", "any", "but", "however", "display", "list", "view", "products", "product",
            "items", "item", "things", "stuff", "latest"
    ));

    public ChatResponse processMessage(String message, Long userId) {
        try {
            logger.info("Processing message: '{}' for user: {}", message, userId);

            String lowerMessage = message.toLowerCase().trim();

            // Handle greetings first
            if (containsAny(lowerMessage, greetings)) {
                return getGreetingResponse();
            }

            // Handle help queries
            if (containsAny(lowerMessage, helpQueries)) {
                return getHelpResponse();
            }

            // Handle order queries (only for logged-in users)
            if (containsAny(lowerMessage, orderQueries)) {
                if (userId == null) {
                    return new ChatResponse(
                            "To check your orders, please log in first. I can help you find products without logging in!",
                            "text"
                    );
                }
                return handleOrderQuery(lowerMessage, userId);
            }

            // Handle "what's available" queries
            if (AVAILABILITY_PATTERN.matcher(lowerMessage).find()) {
                return handleAvailabilityQuery();
            }

            // Handle price-related queries
            if (PRICE_PATTERN.matcher(lowerMessage).find()) {
                return handlePriceQuery();
            }

            // Handle "latest products" specifically
            if (lowerMessage.contains("latest products") || lowerMessage.equals("latest products")) {
                return showAllProducts();
            }

            // Handle "show me X" patterns
            if (SHOW_PRODUCTS_PATTERN.matcher(lowerMessage).matches()) {
                String term = extractTermFromShowMe(lowerMessage);
                if (!term.isEmpty()) {
                    return handleSpecificProductSearch(term);
                }
            }

            // Check for direct category matches
            String detectedCategory = detectDirectCategory(lowerMessage);
            if (detectedCategory != null) {
                logger.info("Detected direct category: {}", detectedCategory);
                return handleCategoryQuery(detectedCategory);
            }

            // Check for explicit "show all products" requests
            if (SHOW_ALL_PRODUCTS_PATTERN.matcher(lowerMessage).matches()) {
                logger.info("Detected show all products request");
                return showAllProducts();
            }

            // Try to extract specific search terms for remaining queries
            String searchTerm = extractSearchTermImproved(lowerMessage);
            logger.info("Extracted search term: '{}'", searchTerm);

            // Only search if we have a valid, specific search term
            if (!searchTerm.isEmpty() && searchTerm.length() > 2 && !isCommonWord(searchTerm)) {
                return searchProductsByTerm(searchTerm);
            }

            // Default response for unclear queries
            return getDefaultResponse();

        } catch (Exception e) {
            logger.error("Error processing message: ", e);
            return new ChatResponse(
                    "Sorry, I encountered an error while processing your request. Please try again!",
                    "error"
            );
        }
    }

    // Extract term from "show me X" pattern
    private String extractTermFromShowMe(String message) {
        Pattern pattern = Pattern.compile("(?i)^show\\s+me\\s+(\\w+)s?$");
        java.util.regex.Matcher matcher = pattern.matcher(message);
        if (matcher.find()) {
            return matcher.group(1).toLowerCase();
        }
        return "";
    }

    // Handle specific product searches with better logic
    private ChatResponse handleSpecificProductSearch(String term) {
        logger.info("Handling specific product search for term: '{}'", term);

        // First check if it's a known category
        String category = categoryMap.get(term);
        if (category != null) {
            return handleCategoryQuery(category);
        }

        // Otherwise search as a product term
        return searchProductsByTerm(term);
    }

    // Improved direct category detection
    private String detectDirectCategory(String message) {
        // Check for exact matches first
        String category = categoryMap.get(message);
        if (category != null) {
            return category;
        }

        // Check for messages that are clearly category requests
        for (Map.Entry<String, String> entry : categoryMap.entrySet()) {
            if (message.equals(entry.getKey())) {
                return entry.getValue();
            }
        }

        return null;
    }

    // Enhanced availability query handler
    private ChatResponse handleAvailabilityQuery() {
        try {
            logger.info("Handling availability query");
            List<Map<String, Object>> availableProducts = productService.getAvailableProducts();

            if (availableProducts.isEmpty()) {
                // Fall back to latest products
                availableProducts = productService.getLatestProducts(8);
            }

            if (availableProducts.isEmpty()) {
                return new ChatResponse("Sorry, I couldn't check stock availability right now. Please try again!", "text");
            }

            return new ChatResponse(
                    "Here are the products currently available:",
                    "product_list",
                    availableProducts.stream().limit(8).map(p -> (Object) p).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error handling availability query: ", e);
            return new ChatResponse("Sorry, I'm having trouble checking availability right now. Please try again!", "text");
        }
    }

    // Enhanced price query handler
    private ChatResponse handlePriceQuery() {
        try {
            logger.info("Handling price query");
            List<Map<String, Object>> products = productService.getLatestProducts(8);

            if (products.isEmpty()) {
                return new ChatResponse("Sorry, I couldn't fetch pricing information right now. Please try again!", "text");
            }

            return new ChatResponse(
                    "Here are some products with their current prices:",
                    "product_list",
                    products.stream().map(p -> (Object) p).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error handling price query: ", e);
            return new ChatResponse("Sorry, I'm having trouble with price information right now. Please try again!", "text");
        }
    }

    // Improved search term extraction
    private String extractSearchTermImproved(String message) {
        logger.debug("Extracting search term from: '{}'", message);

        // Handle common search patterns
        String[] patterns = {
                "find (\\w+)",
                "search (\\w+)",
                "looking for (\\w+)",
                "need (\\w+)",
                "want (\\w+)"
        };

        for (String patternStr : patterns) {
            Pattern pattern = Pattern.compile("(?i)" + patternStr);
            java.util.regex.Matcher matcher = pattern.matcher(message);
            if (matcher.find()) {
                String term = matcher.group(1).toLowerCase();
                if (!stopWords.contains(term) && !isCommonWord(term)) {
                    logger.debug("Found search term from pattern: '{}'", term);
                    return term;
                }
            }
        }

        // Split and clean the message
        String[] words = message.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .split("\\s+");

        // Look for meaningful words that aren't common words
        for (String word : words) {
            word = word.trim();
            if (word.length() > 2 &&
                    !stopWords.contains(word) &&
                    !isCommonWord(word) &&
                    !categoryMap.containsKey(word)) { // Avoid treating categories as search terms
                logger.debug("Found meaningful search term: '{}'", word);
                return word;
            }
        }

        logger.debug("No specific search term found");
        return "";
    }

    // Check if a word is too common to be a useful search term
    private boolean isCommonWord(String word) {
        String[] veryCommonWords = {"products", "product", "items", "item", "things", "stuff",
                "something", "anything", "but", "however", "actually", "really", "show", "find",
                "search", "get", "want", "need", "have", "display", "list", "view", "tech",
                "technology", "available", "stock", "price", "cost"};
        return Arrays.asList(veryCommonWords).contains(word.toLowerCase());
    }

    private ChatResponse showAllProducts() {
        try {
            logger.info("Showing all products (latest products)");
            List<Map<String, Object>> latestProducts = productService.getLatestProducts(10);

            if (latestProducts.isEmpty()) {
                return new ChatResponse("Sorry, no products are available right now.", "text");
            }

            return new ChatResponse(
                    "Here are our available products:",
                    "product_list",
                    latestProducts.stream().map(p -> (Object) p).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error showing all products: ", e);
            return new ChatResponse("Sorry, I'm having trouble fetching products right now. Please try again!", "text");
        }
    }

    private ChatResponse getGreetingResponse() {
        List<String> responses = Arrays.asList(
                "Hello! Welcome to our store! I can help you find products, check your orders, or browse categories. What are you looking for?",
                "Hi there! I'm your shopping assistant. I can help you discover products, check order status, or answer questions about our store!",
                "Hey! Great to see you! I can help you find the perfect products or check your order history. What can I do for you today?"
        );
        String randomResponse = responses.get(new Random().nextInt(responses.size()));
        return new ChatResponse(randomResponse, "greeting");
    }

    private ChatResponse searchProductsByTerm(String searchTerm) {
        try {
            logger.info("Searching products for term: '{}'", searchTerm);
            List<Map<String, Object>> products = productService.searchProducts(searchTerm);

            if (products.isEmpty()) {
                // Get available categories for suggestions
                List<String> categories = new ArrayList<>(Arrays.asList("laptop", "mobile", "computer", "accessories", "electronics"));
                String categorySuggestion = "Try searching for: " + String.join(", ", categories);

                return new ChatResponse(
                        "Sorry, I couldn't find any products matching '" + searchTerm + "'. " + categorySuggestion,
                        "text"
                );
            }

            String responseMessage = products.size() == 1 ?
                    "Found 1 product matching '" + searchTerm + "':" :
                    "Found " + products.size() + " products matching '" + searchTerm + "':";

            return new ChatResponse(
                    responseMessage,
                    "product_list",
                    products.stream().limit(10).map(p -> (Object) p).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error searching products: ", e);
            return new ChatResponse("Sorry, I'm having trouble searching products right now. Please try again!", "text");
        }
    }

    private ChatResponse handleOrderQuery(String message, Long userId) {
        try {
            logger.info("Handling order query for user: {}", userId);
            List<Order> userOrders = orderRepository.findByUser_IdOrderByCreatedAtDesc(userId);

            if (userOrders.isEmpty()) {
                return new ChatResponse(
                        "You don't have any orders yet. Start shopping to place your first order!",
                        "text"
                );
            }

            if (message.contains("latest") || message.contains("recent") || message.contains("last")) {
                Order latestOrder = userOrders.get(0);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
                String formattedDate = latestOrder.getCreatedAt().format(formatter);

                return new ChatResponse(
                        "Your latest order (#" + latestOrder.getId() + ") was placed on " +
                                formattedDate + " with total amount $" + String.format("%.2f", latestOrder.getOrderTotal()) +
                                ". Status: " + latestOrder.getStatus(),
                        "order_info"
                );
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
            String latestOrderDate = userOrders.get(0).getCreatedAt().format(formatter);

            return new ChatResponse(
                    "You have " + userOrders.size() + " order(s). Your latest order was placed on " +
                            latestOrderDate + " for $" + String.format("%.2f", userOrders.get(0).getOrderTotal()),
                    "order_list",
                    userOrders.stream().limit(5).map(o -> (Object) o).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error handling order query: ", e);
            return new ChatResponse("Sorry, I'm having trouble fetching your orders right now. Please try again!", "text");
        }
    }

    private ChatResponse handleCategoryQuery(String category) {
        try {
            logger.info("Category query - handling category: '{}'", category);

            List<Map<String, Object>> categoryProducts = productService.getProductsByCategory(category);

            if (categoryProducts.isEmpty()) {
                List<String> availableCategories = new ArrayList<>(Arrays.asList("laptop", "mobile", "computer", "accessories", "electronics"));
                String suggestion = "Available categories: " + String.join(", ", availableCategories);

                return new ChatResponse(
                        "Sorry, no products found in the " + category + " category. " + suggestion,
                        "text"
                );
            }

            return new ChatResponse(
                    "Here are products in the " + category + " category:",
                    "product_list",
                    categoryProducts.stream().limit(10).map(p -> (Object) p).collect(Collectors.toList())
            );
        } catch (Exception e) {
            logger.error("Error handling category query: ", e);
            return new ChatResponse("Sorry, I'm having trouble browsing categories right now. Please try again!", "text");
        }
    }

    private ChatResponse getHelpResponse() {
        return new ChatResponse(
                "I'm here to help! Here's what I can do:\n\n" +
                        "🔍 **Find Products** - Search by name, category, or brand\n" +
                        "   Example: \"laptop\" or \"show me phones\"\n\n" +
                        "📦 **Check Orders** - View your order history (login required)\n" +
                        "   Example: \"my orders\" or \"order history\"\n\n" +
                        "🏷️ **Browse Categories** - Explore different product types\n" +
                        "   Categories: laptop, mobile, computer, accessories, electronics\n\n" +
                        "💰 **Price & Stock** - Check availability and pricing\n" +
                        "   Example: \"what's available\" or \"price range\"\n\n" +
                        "Just type what you're looking for and I'll help you find it!",
                "help"
        );
    }

    private ChatResponse getDefaultResponse() {
        return new ChatResponse(
                "I'm not sure I understand that. I can help you:\n" +
                        "• Find products (try \"laptop\", \"mobile\", or \"show me phones\")\n" +
                        "• Check your orders (\"my orders\" - login required)\n" +
                        "• Browse categories (laptop, mobile, computer, accessories, electronics)\n" +
                        "• Check what's available (\"what's available\")\n\n" +
                        "Type 'help' for more options!",
                "text"
        );
    }

    // Helper methods
    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
}