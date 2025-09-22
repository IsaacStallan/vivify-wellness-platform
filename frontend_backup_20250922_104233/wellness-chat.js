// Enhanced performance Chat Implementation with Comprehensive Focus & Resilience Support
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatButton = document.getElementById('clearChatButton');
    const resourcesButton = document.getElementById('resourcesButton');
    const crisisButton = document.getElementById('crisisButton');
    
    // Keep track of conversation for context
    let conversationHistory = [];
    let currentTopic = null;
    
    // Response database organized by topic
    const responseDatabase = {
        // ENHANCED Focus & Resilience TOPICS
        
        // Depression
        depression: {
            info: "Depression is more than just feeling sad. It's a common but serious mood disorder that affects how you feel, think, and handle daily activities. Many college students experience depression, and it's important to know that help is available.",
            tips: [
                "Reach out to a Focus & Resilience professional - the counseling center offers free sessions for students.",
                "Stay connected with supportive friends and family even when you don't feel like it.",
                "Try to maintain a regular routine, especially for sleep and meals.",
                "Physical activity, even just a short walk, can help improve your mood through the release of endorphins.",
                "Practice self-compassion and remember that experiencing depression doesn't define you."
            ],
            resources: {
                title: 'Depression Resources',
                content: 'These resources can help with managing depression:',
                resources: [
                    'Campus Counseling Services: Free, confidential sessions',
                    'Depression Support Group: Meets Tuesdays at 4PM',
                    'Online Screening Tool: Confidential assessment',
                    'Therapy Assistance Online (TAO): Self-help modules',
                    'Crisis Support Line: Available 24/7 at (555) 123-4567'
                ],
                primaryAction: 'Schedule Counseling',
                secondaryAction: 'Join Support Group'
            },
            followUp: [
                "How long have you been feeling this way?",
                "What changes have you noticed in your sleep, appetite, or energy levels?",
                "Would you like information about professional support options?"
            ],
            suggestions: [
                "Depression vs sadness",
                "How to support a friend",
                "Managing depression as a student",
                "Talk to a counselor"
            ]
        },
        
        // Anxiety
        anxiety: {
            info: "Anxiety is a normal emotion that can sometimes become overwhelming. Many students experience anxiety, especially during exams or transitions. When anxiety persists and interferes with daily life, it might be an anxiety disorder, which is highly treatable.",
            tips: [
                "Practice grounding techniques - focus on 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
                "Challenge negative thoughts with evidence.",
                "Limit caffeine and sugar which can increase anxiety symptoms.",
                "Try progressive muscle relaxation to release physical tension.",
                "Set aside specific 'worry time' to contain anxious thoughts."
            ],
            resources: {
                title: 'Anxiety Resources',
                content: 'These resources can help with anxiety management:',
                resources: [
                    'Anxiety Support Group: Meets Wednesdays at 5PM',
                    'Anxiety Workbooks: Available at the performance Center',
                    'Counseling Services: One-on-one support available',
                    'Anxiety Management App: Free for students',
                    'Guided Meditation Library: Online access 24/7'
                ],
                primaryAction: 'Join Support Group',
                secondaryAction: 'Download Resources'
            },
            followUp: [
                "Would you like to learn a quick technique to manage anxiety in the moment?",
                "How long have you been experiencing anxiety?",
                "Have you tried any relaxation techniques before?"
            ],
            suggestions: [
                "Anxiety coping techniques",
                "Test anxiety tips",
                "Anxiety vs normal stress",
                "Talk to a counselor"
            ]
        },
        
        // Stress
        stress: {
            info: "Stress is your body's natural response to challenges. While some stress can motivate you, too much can affect your physical and Focus & Resilience. College can be particularly stressful with academic demands, social changes, and future planning.",
            tips: [
                "Try deep breathing: Inhale for 4 counts, hold for 4, exhale for 6.",
                "Take short breaks between study sessions.",
                "Physical activity can help reduce stress hormones.",
                "Talk to someone you trust about what's causing your stress.",
                "Write down your thoughts in a journal to process them."
            ],
            resources: {
                title: 'Stress Management Resources',
                content: 'These resources can help you manage stress:',
                resources: [
                    'Free Counseling Services: Available at the Student Center',
                    'Stress Management Workshops: Every Tuesday at 4PM',
                    'Peer Support Groups: Connect with fellow students',
                    'Mindfulness Sessions: Daily drop-ins at the performance Center',
                    'Stress Management App: Available free to all students'
                ],
                primaryAction: 'Schedule Counseling',
                secondaryAction: 'View All Resources'
            },
            followUp: [
                "Would you like to learn some quick stress relief techniques?",
                "What specific stress are you experiencing right now?",
                "How has stress been affecting your daily life?"
            ],
            suggestions: [
                "Quick stress relief techniques",
                "Long-term stress management",
                "Stress and academic performance",
                "When to seek professional help"
            ]
        },
        
        // Grief
        grief: {
            info: "Grief is a natural response to loss, which can include the death of a loved one, the end of a relationship, or major life transitions. Everyone experiences grief differently, and there's no 'right' way to grieve.",
            tips: [
                "Allow yourself to feel your emotions without judgment.",
                "Be patient with yourself - grief has no timeline.",
                "Maintain routines when possible to provide structure.",
                "Consider joining a grief support group to connect with others who understand.",
                "Take care of your physical needs - proper nutrition, sleep, and exercise can help."
            ],
            resources: {
                title: 'Grief Support Resources',
                content: 'These resources can help with processing grief and loss:',
                resources: [
                    'Grief Counseling: Available through Campus Health Services',
                    'Grief Support Group: Biweekly meetings',
                    'Remembrance Events: Campus memorial services',
                    'Online Resources: Articles and guided meditations',
                    'Peer Support Program: Connect with trained student volunteers'
                ],
                primaryAction: 'Talk to a Counselor',
                secondaryAction: 'Join Support Group'
            },
            followUp: [
                "Would it help to talk more about what you're experiencing?",
                "Have you found any coping strategies that are helpful for you?",
                "How can I best support you during this time?"
            ],
            suggestions: [
                "Coping with grief during school",
                "Supporting grieving friends",
                "Grief vs depression",
                "Self-care during grief"
            ]
        },
        
        // Suicide
        suicide: {
            info: "If you're having thoughts of suicide, please know that you're not alone and help is available. Many people experience suicidal thoughts but find support and recovery. Reaching out is a sign of strength.",
            tips: [
                "If you're in immediate danger, call 988 or go to your nearest emergency room.",
                "Talk to someone you trust about how you're feeling.",
                "Remove access to means of self-harm if possible.",
                "Create a safety plan with specific steps to take when you feel unsafe.",
                "Remember that suicidal thoughts are often temporary and can be treated."
            ],
            resources: {
                title: 'Crisis Resources',
                content: 'These resources provide immediate support:',
                resources: [
                    'National Suicide Prevention Lifeline: 988 (call or text)',
                    'Crisis Text Line: Text HOME to 741741',
                    'Campus Crisis Line: (555) 123-4567 (24/7)',
                    'Campus Counseling Center: Walk-in crisis hours daily 10am-4pm',
                    'Local Emergency Room: University Hospital, 500 College Blvd'
                ],
                primaryAction: 'Call 988 Now',
                secondaryAction: 'Text Crisis Line'
            },
            followUp: [
                "Would you like me to provide information about connecting with a crisis counselor?",
                "Are you in a safe place right now?",
                "Would it help to talk about what's been going on?"
            ],
            suggestions: [
                "Crisis resources",
                "Safety planning",
                "Supporting a friend in crisis",
                "Talk to a counselor now"
            ]
        },
        
        // Trauma
        trauma: {
            info: "Trauma is the emotional response to a deeply distressing or disturbing event. It can affect your thoughts, feelings, and behaviors long after the event has passed. Many students have experienced trauma, and healing is possible.",
            tips: [
                "Work with a trauma-informed therapist who specializes in approaches like EMDR or CBT.",
                "Practice grounding techniques when feeling triggered (like the 5-4-3-2-1 sensory exercise).",
                "Establish routines and predictability to help feel safe.",
                "Consider joining a trauma support group to reduce isolation.",
                "Be patient with your healing journey - recovery isn't linear."
            ],
            resources: {
                title: 'Trauma Support Resources',
                content: 'These resources can help with trauma recovery:',
                resources: [
                    'Trauma-Informed Counseling: Available through Health Services',
                    'Trauma Support Group: Weekly meetings in a confidential setting',
                    'Sexual Assault Response Team: 24/7 advocacy and support',
                    'Trauma Recovery Workbooks: Available at the performance Center',
                    'Campus Safety Escorts: Available 24/7 by calling (555) 789-0123'
                ],
                primaryAction: 'Schedule Trauma Counseling',
                secondaryAction: 'Join Support Group'
            },
            followUp: [
                "Would you like information about trauma-specific therapy approaches?",
                "What kinds of support have you found helpful in the past?",
                "Would you feel comfortable sharing more about what you're experiencing?"
            ],
            suggestions: [
                "Trauma responses explained",
                "Grounding techniques",
                "PTSD vs trauma",
                "Supporting a friend"
            ]
        },
        
        // Eating Disorders
        eatingdisorder: {
            info: "Eating disorders are serious Focus & Resilience conditions characterized by irregular eating habits and distressing thoughts about food, weight, and body image. They're common among college students and require professional treatment.",
            tips: [
                "Seek professional help from specialists in eating disorder treatment.",
                "Try to maintain regular eating patterns even when it's difficult.",
                "Practice self-compassion and challenge negative body thoughts.",
                "Connect with support groups to reduce isolation.",
                "Limit exposure to content that promotes unhealthy body standards."
            ],
            resources: {
                title: 'Eating Disorder Resources',
                content: 'These resources can help with eating disorder recovery:',
                resources: [
                    'Eating Disorder Treatment Team: Medical, nutritional, and psychological care',
                    'Recovery Support Group: Weekly meetings',
                    'Nutritional Counseling: One-on-one support',
                    'Body Image Workshop: Monthly sessions',
                    'National Eating Disorders Helpline: Text NEDA to 741741'
                ],
                primaryAction: 'Schedule Assessment',
                secondaryAction: 'Join Support Group'
            },
            followUp: [
                "Have you spoken with a healthcare provider about these concerns?",
                "Would you like information about treatment options?",
                "What support would be most helpful for you right now?"
            ],
            suggestions: [
                "Eating disorder warning signs",
                "Supporting a friend",
                "Treatment approaches",
                "Body image resources"
            ]
        },
        
        // Sleep related responses
        sleep: {
            info: "Quality sleep is essential for learning, memory, and emotional wellbeing. Most college students need 7-9 hours of sleep per night. Sleep problems are common but can significantly impact academic performance and Focus & Resilience.",
            tips: [
                "Keep a consistent sleep schedule, even on weekends.",
                "Create a relaxing bedtime routine (reading, gentle stretching, etc.).",
                "Make your sleep environment dark, quiet, and cool.",
                "Limit screen time at least 30 minutes before bed.",
                "Avoid caffeine after midday and limit alcohol which disrupts sleep quality."
            ],
            resources: {
                title: 'Sleep Improvement Resources',
                content: 'These resources can help you improve your sleep:',
                resources: [
                    'Sleep Workshop: Monthly sessions on better sleep habits',
                    'Sleep Hygiene Guide: Downloadable PDF',
                    'Sleep Assessment: Available at the Health Center',
                    'Relaxation Audio Library: Guided sleep meditations',
                    'Environmental Consultation: Optimize your sleep space'
                ],
                primaryAction: 'Download Sleep Guide',
                secondaryAction: 'Schedule Assessment'
            },
            followUp: [
                "How many hours of sleep do you typically get?",
                "Do you have trouble falling asleep or staying asleep?",
                "Have you noticed any patterns to your sleep difficulties?"
            ],
            suggestions: [
                "Sleep environment tips",
                "Bedtime routine ideas",
                "Managing late-night studying",
                "Napping strategies"
            ]
        },
        
        insomnia: {
            info: "Insomnia is difficulty falling asleep or staying asleep, even when you have the chance to do so. It's one of the most common sleep problems among college students and can be caused by stress, anxiety, irregular schedules, or other factors.",
            tips: [
                "If you can't sleep after 20 minutes, get up and do something relaxing until you feel sleepy.",
                "Keep a sleep journal to identify patterns and triggers.",
                "Try a guided body scan meditation before bed.",
                "Limit daytime naps to 30 minutes or less.",
                "Consider speaking with a healthcare provider if insomnia persists."
            ],
            resources: {
                title: 'Insomnia Resources',
                content: 'These resources can help with persistent sleep difficulties:',
                resources: [
                    'Cognitive Behavioral Therapy for Insomnia: Available at Health Services',
                    'Sleep Specialist Consultations: By appointment',
                    'Insomnia Support Group: Biweekly meetings',
                    'Digital CBT-I Program: Free access for students',
                    'Sleep Environment Assessment: Personalized recommendations'
                ],
                primaryAction: 'Schedule Health Consultation',
                secondaryAction: 'Join Support Group'
            },
            followUp: [
                "How long have you been experiencing insomnia?",
                "What have you already tried to improve your sleep?",
                "Would you like to learn about cognitive behavioral therapy for insomnia?"
            ],
            suggestions: [
                "CBT techniques for insomnia",
                "Managing racing thoughts",
                "Talk to a health professional",
                "Sleep environment optimization"
            ]
        },
        
        // Nutrition related responses
        nutrition: {
            info: "Proper nutrition is vital for brain function, energy levels, and overall health. As a student, eating well can improve focus, memory, and mood, even when dealing with limited time and budget.",
            tips: [
                "Plan and prep meals ahead to avoid unhealthy convenience options.",
                "Keep nutritious snacks on hand (nuts, fruit, yogurt).",
                "Stay hydrated - even mild dehydration affects concentration.",
                "Include protein with each meal to stay satisfied longer.",
                "Choose complex carbs like whole grains for sustained energy."
            ],
            resources: {
                title: 'Nutrition Resources',
                content: 'These resources can help you maintain healthy eating habits:',
                resources: [
                    'Nutrition Counseling: Free for students',
                    'Dining Hall Nutrition Guide: Find healthy options on campus',
                    'Cooking Workshops: Learn to prepare quick, healthy meals',
                    'Budget Recipe Collection: Eating well on a student budget',
                    'Campus Food Pantry: Free groceries for students in need'
                ],
                primaryAction: 'Schedule Nutrition Counseling',
                secondaryAction: 'View Healthy Recipes'
            },
            followUp: [
                "What's your biggest challenge when it comes to healthy eating?",
                "Would you like some simple meal ideas that work well for students?",
                "Do you have access to cooking facilities or mainly eat at dining halls?"
            ],
            suggestions: [
                "Quick meal ideas",
                "Budget-friendly nutrition",
                "Brain foods for studying",
                "Dining hall nutrition hacks"
            ]
        },
        
        diet: {
            info: "A balanced diet provides the nutrients you need for optimal physical and mental performance. Focus on overall patterns rather than individual meals. Even with limited resources, it's possible to eat well as a student.",
            tips: [
                "Fill half your plate with fruits and vegetables.",
                "Choose lean proteins like chicken, fish, beans, or tofu.",
                "Include sources of healthy fats like nuts, avocados, and olive oil.",
                "Stay mindful of portion sizes, especially when eating out.",
                "Allow yourself occasional treats without guilt - balance is key."
            ],
            resources: {
                title: 'Healthy Eating Resources',
                content: 'These resources can help you develop healthy eating habits:',
                resources: [
                    'Nutrition Assessment: Personalized feedback on your diet',
                    'Meal Planning Tools: Templates and apps for students',
                    'Campus Dietitian: Free consultations available',
                    'Healthy Cooking Demos: Monthly events with free samples',
                    'Online Nutrition Course: Self-paced learning module'
                ],
                primaryAction: 'Schedule Diet Assessment',
                secondaryAction: 'Get Meal Planning Tools'
            },
            followUp: [
                "Do you have any specific dietary preferences or restrictions?",
                "Would you like some tips for eating healthier on a budget?",
                "Have you noticed any connection between what you eat and your energy or mood?"
            ],
            suggestions: [
                "Balanced meal formulas",
                "Eating for energy and focus",
                "Meal prep basics",
                "Nutrition myth busting"
            ]
        },
        
        // Exercise related responses
        exercise: {
            info: "Regular physical activity improves not just physical health but also mental wellbeing, focus, and sleep quality. Even small amounts of movement make a difference, and finding activities you enjoy makes exercise sustainable.",
            tips: [
                "Start small - even 10 minutes of activity provides benefits.",
                "Find activities you enjoy so exercise feels less like a chore.",
                "Schedule workouts like you would a class to maintain consistency.",
                "Use campus facilities like the gym, pool, or recreation center.",
                "Consider walking or biking to class for built-in physical activity."
            ],
            resources: {
                title: 'Fitness Resources',
                content: 'These resources can help you stay physically active:',
                resources: [
                    'Campus Recreation Center: Free for students',
                    'Group Fitness Classes: Everything from yoga to HIIT',
                    'Personal Training: Discounted sessions for students',
                    'Intramural Sports: Casual leagues for various interests',
                    'Walking Trails: Maps available at the performance Center'
                ],
                primaryAction: 'View Fitness Schedule',
                secondaryAction: 'Get Workout Plans'
            },
            followUp: [
                "What types of physical activity do you currently enjoy?",
                "Would you prefer workouts you can do in your room or activities that get you outside?",
                "Are you looking for stress relief, energy boost, or overall fitness?"
            ],
            suggestions: [
                "Dorm room workouts",
                "Exercise for stress relief",
                "Campus fitness options",
                "Beginner workout plan"
            ]
        },
        
        workout: {
            info: "Effective workouts don't require hours at the gym. Short, consistent sessions that fit your schedule and interests are most sustainable for students juggling multiple responsibilities.",
            tips: [
                "Bodyweight exercises like push-ups, squats, and lunges require no equipment.",
                "Try interval training to maximize effectiveness in minimal time.",
                "Include both cardio and strength training for overall fitness.",
                "Consider workout apps or videos designed for small spaces.",
                "Find a workout buddy to help with motivation and accountability."
            ],
            resources: {
                title: 'Workout Resources',
                content: 'These resources can help you establish an effective workout routine:',
                resources: [
                    'Fitness Assessment: Understand your starting point',
                    'Workout Library: Videos and instructions for various exercises',
                    'Equipment Checkout: Borrow fitness gear from Recreation Center',
                    'Virtual Fitness Classes: Participate from your room',
                    'Personalized Program Design: Meet with a fitness specialist'
                ],
                primaryAction: 'Get Workout Plans',
                secondaryAction: 'Schedule Fitness Assessment'
            },
            followUp: [
                "How much time can you realistically commit to exercise each week?",
                "Do you have access to any fitness equipment or prefer bodyweight exercises?",
                "Would you like some workout ideas that can be done in 15-20 minutes?"
            ],
            suggestions: [
                "Quick high-intensity workouts",
                "Strength training basics",
                "No-equipment exercises",
                "Exercise for Focus & Resilience"
            ]
        },
        
        // Social performance responses
        lonely: {
            info: "Feeling lonely is common during college, especially when transitioning to a new environment. Building connections takes time, but there are many ways to meet people and develop meaningful relationships.",
            tips: [
                "Join clubs or organizations related to your interests.",
                "Attend campus events, even if you go by yourself initially.",
                "Study in common areas rather than always in your room.",
                "Volunteer for campus or community service.",
                "Reach out to classmates to form study groups."
            ],
            resources: {
                title: 'Social Connection Resources',
                content: 'These resources can help you build meaningful connections:',
                resources: [
                    'Student Organizations Fair: Hundreds of clubs to join',
                    'Community Building Workshops: Learn social skills',
                    'Peer Mentor Program: Connect with experienced students',
                    'Residence Life Events: Activities in your living community',
                    'Volunteer Opportunities: Meet others while giving back'
                ],
                primaryAction: 'Find Student Organizations',
                secondaryAction: 'Join Peer Support Group'
            },
            followUp: [
                "Have you identified any clubs or activities that interest you?",
                "What kinds of connections are you hoping to build?",
                "Would it help to develop some strategies for introducing yourself to new people?"
            ],
            suggestions: [
                "Making friends on campus",
                "Overcoming social anxiety",
                "Finding your community",
                "Building deeper connections"
            ]
        },
        
        friendship: {
            info: "Meaningful friendships are a key part of college life and contribute significantly to overall wellbeing. Quality often matters more than quantity when it comes to social connections.",
            tips: [
                "Be authentic rather than trying to be someone you're not.",
                "Practice active listening to deepen conversations.",
                "Make regular, small efforts to maintain connections.",
                "Step outside your comfort zone to meet diverse people.",
                "Be patient - deep friendships develop over time."
            ],
            resources: {
                title: 'Relationship Building Resources',
                content: 'These resources can help you develop meaningful friendships:',
                resources: [
                    'Communication Skills Workshop: Monthly sessions',
                    'Friendship and Belonging Group: Weekly discussions',
                    'Cultural Exchange Programs: Connect with international students',
                    'Community Service Projects: Bond while helping others',
                    'Social Events Calendar: Find opportunities to meet people'
                ],
                primaryAction: 'Join Communications Workshop',
                secondaryAction: 'View Campus Events'
            },
            followUp: [
                "What qualities do you value most in friendships?",
                "Are there specific challenges you've faced when trying to make friends?",
                "Would you like strategies for turning acquaintances into closer friends?"
            ],
            suggestions: [
                "Deepening conversations",
                "Finding like-minded people",
                "Maintaining friendships",
                "Resolving friendship conflicts"
            ]
        },
        
        // Academic performance responses
        academic: {
            info: "Academic success is connected to your overall wellbeing. Effective study strategies, time management, and self-care all contribute to your performance and can help reduce stress.",
            tips: [
                "Break large tasks into smaller, manageable chunks.",
                "Study in focused blocks of 25-50 minutes with short breaks.",
                "Vary your study methods to enhance learning and retention.",
                "Utilize campus resources like tutoring and writing centers.",
                "Balance academics with other aspects of wellbeing."
            ],
            resources: {
                title: 'Academic Success Resources',
                content: 'These resources can help you thrive academically:',
                resources: [
                    'Academic Coaching: One-on-one support for study skills',
                    'Tutoring Services: Available for most subjects',
                    'Writing Center: Help with papers and projects',
                    'Time Management Workshops: Learn to balance your schedule',
                    'Study Skills Assessment: Identify your strengths and areas for growth'
                ],
                primaryAction: 'Schedule Academic Coaching',
                secondaryAction: 'Find Study Skills Resources'
            },
            followUp: [
                "What specific academic challenges are you currently facing?",
                "Which subjects or types of assignments do you find most difficult?",
                "Would you like to learn about evidence-based study techniques?"
            ],
            suggestions: [
                "Effective study techniques",
                "Time management strategies",
                "Test preparation tips",
                "Overcoming procrastination"
            ]
        },
        
        studying: {
            info: "Effective studying isn't about hours spent but about quality of focus, techniques used, and how well you take care of your brain's needs. Research-backed approaches can help you learn more effectively while studying less.",
            tips: [
                "Find your optimal environment - some need quiet, others prefer ambient noise.",
                "Use active recall rather than passive re-reading.",
                "Create concept maps to connect ideas visually.",
                "Teach concepts to someone else to solidify understanding.",
                "Distribute practice over time rather than cramming."
            ],
            resources: {
                title: 'Study Skills Resources',
                content: 'These resources can help you study more effectively:',
                resources: [
                    'Learning Strategies Center: Workshops and individual coaching',
                    'Study Skills Courses: Credit and non-credit options',
                    'Subject-Specific Tutoring: Drop-in and appointment-based',
                    'Focus Tools Workshop: Learn techniques to enhance concentration',
                    'Digital Learning Resources: Online modules and assessments'
                ],
                primaryAction: 'Take Study Skills Assessment',
                secondaryAction: 'Book Tutoring Session'
            },
            followUp: [
                "What's your current approach to studying for exams?",
                "Do you find it difficult to maintain focus while studying?",
                "Would you like to learn about spaced repetition and other evidence-based techniques?"
            ],
            suggestions: [
                "Memory improvement techniques",
                "Creating effective study guides",
                "Study group strategies",
                "Subject-specific study methods"
            ]
        },
        
        // Default responses when no specific topic is detected
        general: {
            info: "performance encompasses multiple dimensions including physical, mental, social, and academic health. Each aspect affects the others, creating a holistic picture of wellbeing.",
            tips: [
                "Make self-care a regular part of your routine, not just during stressful times.",
                "Start small when building new habits - consistency matters more than perfection.",
                "Connect with others who share your performance goals for mutual support.",
                "Regularly check in with yourself about what's working and what isn't.",
                "Utilize the many student performance resources available on campus."
            ],
            resources: {
                title: 'performance Resources',
                content: 'These resources support overall student wellbeing:',
                resources: [
                    'performance Center: Hub for health and wellbeing services',
                    'Counseling Services: Free sessions for all students',
                    'Recreation Facilities: Gym, pool, courts, and more',
                    'Peer performance Coaching: One-on-one support',
                    'performance Workshops: Covering all dimensions of health'
                ],
                primaryAction: 'Schedule performance Assessment',
                secondaryAction: 'Explore All Resources'
            },
            followUp: [
                "Which aspect of performance would you like to focus on today?",
                "What performance goals are you currently working toward?",
                "Would you like to learn about the different dimensions of performance?"
            ],
            suggestions: [
                "Mental performance resources",
                "Physical health tips",
                "Academic success strategies",
                "Social connection ideas"
            ]
        }
    };
    
    // Greeting variations
    const greetings = [
        "Hi there! How can I support your performance today?",
        "Hello! I'm here to help. What performance topic would you like to discuss?",
        "Welcome! How can I assist with your wellbeing today?",
        "Hi! What aspect of performance are you interested in exploring?"
    ];
    
    // Thank you response variations
    const thankYouResponses = [
        "You're welcome! I'm happy I could help. Is there anything else you'd like to discuss?",
        "Glad I could assist! Let me know if you have any other questions about performance.",
        "You're very welcome! Is there anything else I can help with today?",
        "Happy to help! Don't hesitate to reach out if you need more information."
    ];
    
    // Add initial welcome message
    function addWelcomeMessage() {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <h3 class="welcome-header">Welcome to Vivify's performance Assistant!</h3>
            <p>Hi there! I'm here to help you explore performance resources, answer questions, and provide support with your performance journey. You can ask me about:</p>
            <ul>
                <li>Focus & Resilience topics like stress, anxiety, depression, and more</li>
                <li>Fitness and workout recommendations</li>
                <li>Nutrition guidance for students</li>
                <li>Sleep improvement techniques</li>
                <li>Academic performance and study strategies</li>
                <li>Social performance and building connections</li>
            </ul>
            <p>What would you like to talk about today?</p>
        `;
        chatMessages.appendChild(welcomeMessage);
        
        // Initial assistant message
        addAssistantMessage(getRandomGreeting());
        
        // Add suggestion chips
        addSuggestionChips([
            "I'm feeling stressed about exams",
            "I need help with sleep",
            "Can you tell me about depression?",
            "How can I eat healthier on campus?",
            "Feeling lonely or isolated"
        ]);
    }
    
    // Function to get a random greeting
    function getRandomGreeting() {
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Function to get a random thank you response
    function getRandomThankYouResponse() {
        return thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    }
    
    // Function to add user message to the chat
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-user';
        
        // Format message text (replace newlines with <br>)
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
        
        // Add timestamp
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = 'Just now';
        messageElement.appendChild(timeElement);
        
        chatMessages.appendChild(messageElement);
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            content: text
        });
        
        // Keep conversation history to last 10 messages
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
        }
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // Function to add assistant message to the chat
   function addAssistantMessage(text) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-assistant';
    
    // Format message text (replace newlines with <br>)
    messageElement.innerHTML = text.replace(/\n/g, '<br>');
    
    // Add timestamp
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = 'Just now';
    messageElement.appendChild(timeElement);
    
    chatMessages.appendChild(messageElement);
    
    // Add to conversation history
    conversationHistory.push({
        role: "assistant",
        content: text
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to add suggestion chips
function addSuggestionChips(suggestions) {
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container';
    
    suggestions.forEach(suggestion => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.addEventListener('click', function() {
            const chipText = this.textContent;
            addUserMessage(chipText);
            suggestionsContainer.remove();
            
            // Process user message
            processUserMessage(chipText);
        });
        suggestionsContainer.appendChild(chip);
    });
    
    chatMessages.appendChild(suggestionsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add resource message card
function addResourceMessage(resource) {
    const resourceElement = document.createElement('div');
    resourceElement.className = 'message message-resource';
    
    // Create header
    const headerElement = document.createElement('div');
    headerElement.className = 'resource-header';
    headerElement.innerHTML = `<h4>${resource.title}</h4>`;
    resourceElement.appendChild(headerElement);
    
    // Create content
    const contentElement = document.createElement('div');
    contentElement.className = 'resource-content';
    
    // Add main content
    const contentParagraph = document.createElement('p');
    contentParagraph.textContent = resource.content;
    contentElement.appendChild(contentParagraph);
    
    // Add resources list if available
    if (resource.resources && resource.resources.length) {
        const resourcesList = document.createElement('ul');
        resourcesList.style.paddingLeft = '20px';
        resourcesList.style.margin = '10px 0';
        
        resource.resources.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            listItem.style.margin = '5px 0';
            listItem.style.fontSize = '0.85rem';
            resourcesList.appendChild(listItem);
        });
        
        contentElement.appendChild(resourcesList);
    }
    
    resourceElement.appendChild(contentElement);
    
    // Add actions
    const actionsElement = document.createElement('div');
    actionsElement.className = 'resource-actions';
    
    // Primary action button
    if (resource.primaryAction) {
        const primaryBtn = document.createElement('button');
        primaryBtn.className = 'resource-btn resource-btn-primary';
        primaryBtn.innerHTML = `<i class="fas fa-external-link-alt"></i> ${resource.primaryAction}`;
        primaryBtn.addEventListener('click', function() {
            addUserMessage(`I want to ${resource.primaryAction}`);
            processUserMessage(`I want to ${resource.primaryAction}`);
        });
        actionsElement.appendChild(primaryBtn);
    }
    
    // Secondary action button
    if (resource.secondaryAction) {
        const secondaryBtn = document.createElement('button');
        secondaryBtn.className = 'resource-btn';
        secondaryBtn.innerHTML = `<i class="fas fa-list"></i> ${resource.secondaryAction}`;
        secondaryBtn.addEventListener('click', function() {
            addUserMessage(`I want to ${resource.secondaryAction}`);
            processUserMessage(`I want to ${resource.secondaryAction}`);
        });
        actionsElement.appendChild(secondaryBtn);
    }
    
    resourceElement.appendChild(actionsElement);
    
    chatMessages.appendChild(resourceElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Hide typing indicator
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Function to send message when button is clicked
function sendMessage() {
    if (!messageInput || !messageInput.value.trim()) return;
    
    const messageText = messageInput.value.trim();
    addUserMessage(messageText);
    
    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendButton.setAttribute('disabled', 'disabled');
    
    // Process user message
    processUserMessage(messageText);
}

// Process user message and generate response
function processUserMessage(message) {
    // First check for crisis situations
    if (detectCrisis(message)) {
        // Show typing indicator
        showTypingIndicator();
        
        setTimeout(() => {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Provide crisis response
            addAssistantMessage(
                "I notice you mentioned something that sounds serious. If you're having thoughts about harming yourself, please know that help is available right now.\n\n" +
                "• Call or text 988 for the National Suicide Prevention Lifeline\n" +
                "• Text HOME to 741741 for the Crisis Text Line\n" +
                "• Call the Campus Crisis Line at (555) 123-4567\n\n" +
                "Would you like me to provide more information about these resources or other support options?"
            );
            
            // Add crisis resource card
            addResourceMessage(responseDatabase.suicide.resources);
            
            // Add supportive suggestion chips
            addSuggestionChips([
                "Yes, tell me more about crisis resources",
                "I want to talk to someone now",
                "What if I'm worried about a friend?",
                "I'm okay, just looking for information"
            ]);
            
        }, 1000);
        
        return;
    }
    
    // Show typing indicator
    showTypingIndicator();
    
    // Identify topic based on keywords
    const topic = identifyTopic(message);
    currentTopic = topic; // Update current topic
    
    // Determine response type based on message content and context
    const responseType = determineResponseType(message, topic);
    
    // Generate delay based on response length
    const delay = Math.floor(Math.random() * 1000) + 1000; // 1-2 second delay
    
    setTimeout(() => {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Generate and display response
        const response = generateResponse(topic, responseType);
        addAssistantMessage(response);
        
        // Handle follow-ups based on response type
        handleFollowUp(topic, responseType);
    }, delay);
}

// Detect crisis situations in messages
function detectCrisis(message) {
    const lowerMessage = message.toLowerCase();
    
    // Crisis keywords
    const crisisKeywords = [
        "suicid", "kill myself", "end my life", "don't want to live",
        "want to die", "harm myself", "hurt myself", "take my own life",
        "no reason to live", "better off dead", "no point in living",
        "give up on life", "ending it all"
    ];
    
    // Check if any crisis keywords are present
    for (const keyword of crisisKeywords) {
        if (lowerMessage.includes(keyword)) {
            return true;
        }
    }
    
    return false;
}

// ENHANCED: Identify topic based on keywords in message
function identifyTopic(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for thank you
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
        return "thanks";
    }
    
    // Check for greetings
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || 
        lowerMessage.includes("hey") || lowerMessage.match(/^(good\s+)?(morning|afternoon|evening)/)) {
        return "greeting";
    }
    
    // Focus & Resilience topics
    
    // Depression
    if (lowerMessage.includes("depress") || lowerMessage.includes("sad") || 
        lowerMessage.includes("hopeless") || lowerMessage.includes("worthless") ||
        lowerMessage.includes("empty") || lowerMessage.includes("mood") ||
        lowerMessage.includes("unmotivated") || lowerMessage.includes("low energy")) {
        return "depression";
    }
    
    // Anxiety
    if (lowerMessage.includes("anxi") || lowerMessage.includes("worr") || 
        lowerMessage.includes("panic") || lowerMessage.includes("nervous") ||
        lowerMessage.includes("fear") || lowerMessage.includes("phobia") ||
        lowerMessage.includes("stress out") || lowerMessage.includes("on edge")) {
        return "anxiety";
    }
    
    // Stress
    if (lowerMessage.includes("stress") || lowerMessage.includes("overwhelm") || 
        lowerMessage.includes("pressure") || lowerMessage.includes("burnout") ||
        lowerMessage.includes("too much") || lowerMessage.includes("can't cope")) {
        return "stress";
    }
    
    // Grief & Loss
    if (lowerMessage.includes("grief") || lowerMessage.includes("loss") || 
        lowerMessage.includes("bereav") || lowerMessage.includes("death") ||
        lowerMessage.includes("died") || lowerMessage.includes("mourn") ||
        lowerMessage.includes("missing someone")) {
        return "grief";
    }
    
    // Trauma
    if (lowerMessage.includes("trauma") || lowerMessage.includes("ptsd") || 
        lowerMessage.includes("abuse") || lowerMessage.includes("assault") ||
        lowerMessage.includes("victim") || lowerMessage.includes("survivor") ||
        lowerMessage.includes("flashback") || lowerMessage.includes("triggering")) {
        return "trauma";
    }
    
    // Eating Disorders
    if (lowerMessage.includes("eating disorder") || lowerMessage.includes("anorexia") || 
        lowerMessage.includes("bulimia") || lowerMessage.includes("binge") ||
        lowerMessage.includes("purge") || lowerMessage.includes("body image") ||
        lowerMessage.includes("food issues")) {
        return "eatingdisorder";
    }
    
    // Sleep topics
    if (lowerMessage.includes("sleep") || lowerMessage.includes("tired") || 
        lowerMessage.includes("fatigue") || lowerMessage.includes("rest") ||
        lowerMessage.includes("exhaust") || lowerMessage.includes("drowsy")) {
        return "sleep";
    }
    
    if (lowerMessage.includes("insomnia") || lowerMessage.includes("can't sleep") || 
        lowerMessage.includes("trouble sleeping") || lowerMessage.includes("awake at night") ||
        lowerMessage.includes("difficulty falling asleep") || lowerMessage.includes("wake up early")) {
        return "insomnia";
    }
    
    // Nutrition topics
    if (lowerMessage.includes("nutrition") || lowerMessage.includes("eat") || 
        lowerMessage.includes("food") || lowerMessage.includes("meal") ||
        lowerMessage.includes("hungry") || lowerMessage.includes("appetite") ||
        lowerMessage.includes("diet")) {
        return "nutrition";
    }
    
    if (lowerMessage.includes("healthy eating") || lowerMessage.includes("calorie") || 
        lowerMessage.includes("weight") || lowerMessage.includes("nutrient") || 
        lowerMessage.includes("protein") || lowerMessage.includes("balanced diet")) {
        return "diet";
    }
    
    // Exercise topics
    if (lowerMessage.includes("exercise") || lowerMessage.includes("active") || 
        lowerMessage.includes("fitness") || lowerMessage.includes("physical") ||
        lowerMessage.includes("move") || lowerMessage.includes("activity") ||
        lowerMessage.includes("workout")) {
        return "exercise";
    }
    
    if (lowerMessage.includes("gym") || lowerMessage.includes("training") || 
        lowerMessage.includes("cardio") || lowerMessage.includes("strength") || 
        lowerMessage.includes("running") || lowerMessage.includes("weight training")) {
        return "workout";
    }
    
    // Social performance topics
    if (lowerMessage.includes("lonely") || lowerMessage.includes("alone") || 
        lowerMessage.includes("isolat") || lowerMessage.includes("no friends") ||
        lowerMessage.includes("by myself") || lowerMessage.includes("no one") ||
        lowerMessage.includes("disconnected")) {
        return "lonely";
    }
    
    if (lowerMessage.includes("friend") || lowerMessage.includes("social") || 
        lowerMessage.includes("relationship") || lowerMessage.includes("connect") ||
        lowerMessage.includes("community") || lowerMessage.includes("belonging") ||
        lowerMessage.includes("making friends")) {
        return "friendship";
    }
    
    // Academic topics
    if (lowerMessage.includes("academic") || lowerMessage.includes("class") || 
        lowerMessage.includes("grade") || lowerMessage.includes("course") ||
        lowerMessage.includes("professor") || lowerMessage.includes("lecture") ||
        lowerMessage.includes("assignment")) {
        return "academic";
    }
    
    if (lowerMessage.includes("study") || lowerMessage.includes("exam") || 
        lowerMessage.includes("test") || lowerMessage.includes("homework") ||
        lowerMessage.includes("paper") || lowerMessage.includes("research") ||
        lowerMessage.includes("focus") || lowerMessage.includes("concentration")) {
        return "studying";
    }
    
    // If previous topic exists and no new topic is detected, continue with previous topic
    if (currentTopic && currentTopic !== "greeting" && currentTopic !== "thanks") {
        return currentTopic;
    }
    
    // Default general topic if no specific topic is detected
    return "general";
}

// Determine response type based on message content and context
function determineResponseType(message, topic) {
    const lowerMessage = message.toLowerCase();
    
    // Return specific response types for special topics
    if (topic === "thanks") {
        return "thanks";
    }
    
    if (topic === "greeting") {
        return "greeting";
    }
    
    // Check if the message is a question
    if (lowerMessage.includes("?") || 
        lowerMessage.includes("how") || 
        lowerMessage.includes("what") || 
        lowerMessage.includes("why") || 
        lowerMessage.includes("where") || 
        lowerMessage.includes("when") || 
        lowerMessage.includes("can you") ||
        lowerMessage.includes("tell me about")) {
        return "info";
    }
    
    // Check if asking for tips or help
    if (lowerMessage.includes("help") || 
        lowerMessage.includes("tip") || 
        lowerMessage.includes("advice") || 
        lowerMessage.includes("suggestion") || 
        lowerMessage.includes("how to") || 
        lowerMessage.includes("how can i") ||
        lowerMessage.includes("ways to")) {
        return "tips";
    }
    
    // Check if asking for resources
    if (lowerMessage.includes("resource") || 
        lowerMessage.includes("where can i") || 
        lowerMessage.includes("service") || 
        lowerMessage.includes("support") || 
        lowerMessage.includes("program") || 
        lowerMessage.includes("workshop") ||
        lowerMessage.includes("counseling") ||
        lowerMessage.includes("therapy")) {
        return "resources";
    }
    
    // Default response type if no specific intent is detected
    // Alternate between info and tips to keep conversation engaging
    const lastResponse = conversationHistory.length > 1 ? 
        conversationHistory[conversationHistory.length - 2] : null;
        
    if (lastResponse && lastResponse.role === "assistant") {
        // If last assistant message was info, provide tips next
        if (lastResponse.content.includes(responseDatabase[topic].info)) {
            return "tips";
        }
        // If last message included tips, provide a follow-up question
        else if (lastResponse.content.includes(responseDatabase[topic].tips[0])) {
            return "followUp";
        }
    }
    
    // Default to info
    return "info";
}

// Generate response based on topic and response type
function generateResponse(topic, responseType) {
    switch(responseType) {
        case "greeting":
            return getRandomGreeting();
            
        case "thanks":
            return getRandomThankYouResponse();
            
        case "info":
            return responseDatabase[topic].info;
            
        case "tips":
            // Select 2-3 random tips without duplicates
            const tips = responseDatabase[topic].tips;
            const selectedTips = getRandomElements(tips, Math.min(3, tips.length));
            
            return `Here are some tips that might help:\n\n• ${selectedTips.join('\n\n• ')}`;
            
        case "resources":
            // Return text about resources, but also display resource card
            setTimeout(() => {
                if (responseDatabase[topic].resources) {
                    addResourceMessage(responseDatabase[topic].resources);
                }
            }, 500);
            
            return `There are several resources available to help with ${topic}. I'll show you some options that might be useful.`;
            
        case "followUp":
            // Select a random follow-up question
            const followUps = responseDatabase[topic].followUp;
            if (followUps && followUps.length > 0) {
                const randomIndex = Math.floor(Math.random() * followUps.length);
                return followUps[randomIndex];
            }
            return `Would you like to know more about ${topic}?`;
            
        default:
            return responseDatabase[topic].info;
    }
}

// Handle follow-up interactions after response
function handleFollowUp(topic, responseType) {
    // Add suggestion chips after most responses
    if (responseType !== "greeting" && responseType !== "thanks") {
        setTimeout(() => {
            // Get suggestions specific to the topic
            const suggestions = responseDatabase[topic].suggestions || 
                responseDatabase.general.suggestions;
                
            addSuggestionChips(suggestions);
        }, 500);
    }
}

// Helper function to get random elements from array without duplicates
function getRandomElements(array, count) {
    const result = [];
    const copy = [...array];
    
    count = Math.min(count, copy.length);
    
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * copy.length);
        result.push(copy[index]);
        copy.splice(index, 1);
    }
    
    return result;
}

// Set up event listeners

// Send message on button click
if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
}

// Send message on Enter key (but allow Shift+Enter for new line)
if (messageInput) {
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea as user types
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button based on content
        if (this.value.trim()) {
            sendButton.removeAttribute('disabled');
        } else {
            sendButton.setAttribute('disabled', 'disabled');
        }
    });
}

// Crisis button functionality
if (crisisButton) {
    crisisButton.addEventListener('click', function() {
        addResourceMessage({
            title: 'Crisis Support Resources',
            content: 'If you\'re experiencing a Focus & Resilience crisis or need immediate support, please reach out to one of these resources:',
            resources: [
                'Campus Counseling Center: (555) 123-4567 - Available 24/7',
                'Crisis Text Line: Text HOME to 741741',
                'National Suicide Prevention Lifeline: 988 or 1-800-273-8255',
                'Campus Health Center: Student Center, Room 200'
            ],
            primaryAction: 'Call Counseling Center',
            secondaryAction: 'View All Resources'
        });
    });
}

// Resources button functionality
if (resourcesButton) {
    resourcesButton.addEventListener('click', function() {
        addAssistantMessage("Here are some performance resources that might be helpful. What specific area are you interested in?");
        
        addSuggestionChips([
            "Focus & Resilience",
            "Physical performance",
            "Nutrition",
            "Sleep",
            "Academic Success"
        ]);
    });
}

// Clear chat functionality
if (clearChatButton) {
    clearChatButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear chat messages
            chatMessages.innerHTML = '';
            
            // Reset conversation history and current topic
            conversationHistory = [];
            currentTopic = null;
            
            // Add welcome message back
            addWelcomeMessage();
        }
    });
}

// Initialize chat with welcome message
addWelcomeMessage();
});