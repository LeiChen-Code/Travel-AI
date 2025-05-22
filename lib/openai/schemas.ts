// 此文件定义三个 JSON 模式，分别对应不同批次的 AI 生成需求

export const batch1Schema = {
    type: "object",
    properties: {
        abouttheplace: {
            type: "string",
            description: "about the place in atleast 50 words",
        },
        besttimetovisit: {
            type: "string",
            description: "Best time to visit",
        },

    },
    "required": [
        "abouttheplace",
        "besttimetovisit"
    ],
};

export const batch2Schema = {
    type: "object",
    properties: {
        localfood: {
            type: "array",
            description: "Local Cuisine Recommendations",
            items: { type: "string" },
        },
        packingchecklist: {
            type: "array",
            description: "Packing Checklist",
            items: { type: "string" },
        },
    },
    "required": [
        "localfood",
        "packingchecklist"
    ],
};

export const batch3Schema = {
    type: "object",
    properties: {
        itinerary: {
            type: "array",
            description: "Itinerary for the specified number of days in array format",
            items: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Day title" },
                    activities: {
                        type: "object",
                        properties: {
                            morning: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        itineraryItem: { type: "string", description: "About the itinerary item" },
                                        briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                                    },
                                    required: ["itineraryItem", "briefDescription"],
                                },
                            },
                            afternoon: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        itineraryItem: { type: "string", description: "About the itinerary item" },
                                        briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                                    },
                                    required: ["itineraryItem", "briefDescription"],
                                },
                            },
                            evening: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        itineraryItem: { type: "string", description: "About the itinerary item" },
                                        briefDescription: { type: "string", description: "Elaborate about the place suggested" }
                                    },
                                    required: ["itineraryItem", "briefDescription"],
                                },
                            },
                        },
                        required: ["morning", "afternoon", "evening"],
                    },
                },
                required: ["title", "activities"],
            },
        },
    },
    "required": [
        "itinerary",
    ],
};