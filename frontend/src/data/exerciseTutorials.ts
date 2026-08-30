export interface ExerciseTutorial {
  steps: string[];
  tips?: string[];
}

/** Keyed by Exercise.id from `data/exercises.ts` — every one of the 71 bundled exercises has an entry.
 *  Written in plain, beginner-friendly language — no gym jargon, short simple sentences. */
export const EXERCISE_TUTORIALS: Record<string, ExerciseTutorial> = {
  // Chest
  'barbell-bench-press': {
    steps: [
      'Lie flat on your back on the bench. Your eyes should be right under the bar.',
      'Grab the bar with both hands, a little wider than your shoulders. Lift it off the rack and hold it above your chest.',
      'Slowly bend your elbows to lower the bar down until it almost touches your chest.',
      'Push the bar back up until your arms are straight again.',
      'That is one rep. Repeat, and place the bar back on the rack when you are done.',
    ],
    tips: ['Keep your feet flat on the floor the whole time.', 'Don\'t let the bar drop fast or bounce off your chest — go slow and controlled.'],
  },
  'incline-barbell-bench-press': {
    steps: [
      'Set the bench so the back is tilted up (about a 30–45 degree angle) and lie back on it.',
      'Grab the bar a little wider than your shoulders and lift it off the rack, holding it above your upper chest.',
      'Slowly lower the bar down to your upper chest.',
      'Push it back up until your arms are straight.',
      'Repeat, always lowering the bar slowly instead of letting it drop.',
    ],
    tips: ['Don\'t tilt the bench too high — that turns it into more of a shoulder exercise.'],
  },
  'dumbbell-bench-press': {
    steps: [
      'Sit on the bench holding one dumbbell in each hand, then lie back, bringing the dumbbells up near your chest.',
      'Hold a dumbbell in each hand at chest level, palms facing your feet.',
      'Push both dumbbells straight up until your arms are fully extended.',
      'Slowly lower them back down to chest level.',
      'Repeat. When finished, bring the dumbbells to your knees before sitting up.',
    ],
    tips: ['Keep your wrists straight, not bent, while pressing.'],
  },
  'dumbbell-fly': {
    steps: [
      'Lie on a flat bench holding a dumbbell in each hand above your chest, palms facing each other.',
      'Keep a small bend in your elbows and slowly open your arms out to the sides, like you\'re hugging a big tree.',
      'Lower until you feel a gentle stretch across your chest.',
      'Bring the dumbbells back up along the same path, squeezing your chest together.',
      'Keep your elbows slightly bent the whole time — this is not a pressing movement.',
    ],
    tips: ['Use lighter dumbbells than you would for a bench press — this move puts more strain on the shoulders.'],
  },
  'cable-chest-fly': {
    steps: [
      'Set both cable handles at chest height and stand in the middle, between the two machines.',
      'Hold a handle in each hand and step forward so the cables have some tension (pull).',
      'With a small bend in your elbows, bring both hands together in front of your chest.',
      'Squeeze your chest when your hands meet in the middle.',
      'Slowly let your arms open back out to the starting position.',
    ],
  },
  'machine-chest-press': {
    steps: [
      'Adjust the seat so the handles are level with the middle of your chest.',
      'Sit back with your shoulders relaxed and feet flat on the floor.',
      'Hold the handles and push them forward until your arms are straight.',
      'Pause for a second, then slowly bring the handles back to the start.',
      'Keep your back resting against the pad the whole time.',
    ],
  },
  'push-up': {
    steps: [
      'Get on the floor on your hands and toes, hands a little wider than your shoulders.',
      'Keep your body in one straight line from your head to your heels.',
      'Bend your elbows to slowly lower your chest toward the floor.',
      'Push yourself back up until your arms are straight again.',
      'Repeat, keeping your hips from sagging down or sticking up.',
    ],
    tips: ['If a normal push-up is too hard, do it on your knees instead — same straight-body form.'],
  },
  'band-chest-press': {
    steps: [
      'Loop the band around something sturdy behind you, at chest height. Hold one end in each hand.',
      'Step forward until the band feels tight, with one foot slightly in front of the other.',
      'Push both hands forward until your arms are straight, palms facing down.',
      'Squeeze your chest when your arms are fully out.',
      'Slowly bring your hands back to the starting position, keeping the band tight the whole time.',
    ],
  },

  // Back
  'pull-up': {
    steps: [
      'Grab the bar with both hands, a little wider than your shoulders, palms facing away from you.',
      'Hang with your arms fully straight.',
      'Pull yourself up by bending your elbows until your chin is above the bar.',
      'Pause for a moment at the top.',
      'Slowly lower yourself back down until your arms are straight again.',
    ],
    tips: ['Too hard at first? Use an assisted pull-up machine or a resistance band looped over the bar to help you up.'],
  },
  'barbell-bent-over-row': {
    steps: [
      'Stand with your feet shoulder-width apart, holding the bar with both hands, palms facing down.',
      'Bend forward from your hips (keep your back straight, like a flat table) until your chest is about halfway to the floor.',
      'Let the bar hang down with your arms straight.',
      'Pull the bar up toward your belly button, keeping your elbows close to your body.',
      'Slowly lower the bar back down and repeat.',
    ],
    tips: ['Keep your stomach tight and your back flat — never let it round.'],
  },
  'dumbbell-row': {
    steps: [
      'Put one knee and one hand on a bench, with your other foot on the floor for balance.',
      'Hold a dumbbell in your free hand and let your arm hang straight down.',
      'Pull the dumbbell up toward your hip, keeping your elbow close to your side.',
      'Squeeze your back at the top of the movement.',
      'Slowly lower the dumbbell back down. Finish all reps, then switch sides.',
    ],
  },
  'lat-pulldown': {
    steps: [
      'Sit down at the machine and tuck your thighs under the pads.',
      'Grab the bar with both hands, wider than your shoulders, palms facing away from you.',
      'Pull the bar down to your upper chest, leaning back just a little.',
      'Squeeze your shoulder blades together at the bottom.',
      'Slowly let the bar rise back up until your arms are straight.',
    ],
    tips: ['Pull with your back muscles, not by yanking your body backward.'],
  },
  'seated-cable-row': {
    steps: [
      'Sit at the machine with your knees slightly bent and feet resting on the footplate.',
      'Grab the handle with both hands, arms straight out in front of you.',
      'Pull the handle toward your stomach, keeping your back straight and elbows close to your sides.',
      'Squeeze your shoulder blades together at the end of the pull.',
      'Slowly let your arms straighten back out and repeat.',
    ],
  },
  'kettlebell-row': {
    steps: [
      'Bend forward from your hips holding a kettlebell in one hand, using your other hand on a bench or your knee for support.',
      'Let the kettlebell hang down with your arm straight, keeping your back flat.',
      'Pull the kettlebell up toward your hip, elbow close to your body.',
      'Squeeze at the top, then slowly lower it back down.',
      'Finish all reps on one side, then switch to the other.',
    ],
  },
  'band-row': {
    steps: [
      'Loop the band around something in front of you at chest height, then step back until it feels tight.',
      'Hold one handle in each hand with your arms stretched out in front of you.',
      'Pull both handles toward your body, elbows going back and staying close to your sides.',
      'Squeeze your shoulder blades together at the end.',
      'Slowly let your arms go back out and repeat.',
    ],
  },
  'machine-row': {
    steps: [
      'Sit at the machine with your chest resting against the pad.',
      'Grab the handles with your arms stretched out.',
      'Pull the handles back toward you, squeezing your shoulder blades together.',
      'Pause for a moment, then slowly let your arms go back out.',
      'Keep your chest pressed against the pad the whole time.',
    ],
  },

  // Shoulders
  'dumbbell-shoulder-press': {
    steps: [
      'Sit or stand holding a dumbbell in each hand at shoulder height, palms facing forward.',
      'Tighten your stomach muscles and push both dumbbells straight up above your head.',
      'Bring the dumbbells close together at the top, without letting them bang into each other.',
      'Slowly lower them back down to shoulder height.',
      'Repeat, keeping your body upright the whole time.',
    ],
  },
  'barbell-overhead-press': {
    steps: [
      'Stand with your feet shoulder-width apart, the bar resting on the front of your shoulders.',
      'Grip the bar just outside your shoulders.',
      'Tighten your stomach and push the bar straight up above your head.',
      'Fully straighten your arms with the bar directly over your head.',
      'Slowly lower the bar back down to your shoulders and repeat.',
    ],
    tips: ['Squeeze your bottom (glutes) as you press — it helps stop your lower back from arching too much.'],
  },
  'dumbbell-lateral-raise': {
    steps: [
      'Stand holding a dumbbell in each hand down by your sides, palms facing your body.',
      'With a small bend in your elbows, lift both arms straight out to the sides.',
      'Raise them until they are about level with your shoulders, like making a "T" shape.',
      'Pause for a second at the top.',
      'Slowly lower your arms back down and repeat.',
    ],
    tips: ['Use light weights here — swinging heavy weights up is a common beginner mistake.'],
  },
  'kettlebell-overhead-press': {
    steps: [
      'Hold a kettlebell up at shoulder height, elbow tucked in close to your body.',
      'Tighten your stomach and push the kettlebell straight up above your head.',
      'Fully straighten your arm with the kettlebell above your shoulder.',
      'Slowly lower it back down to shoulder height.',
      'Finish all reps on one side, then switch to the other.',
    ],
  },
  'cable-lateral-raise': {
    steps: [
      'Stand sideways next to a low cable machine, holding the handle in the hand farthest away from it.',
      'Keep a small bend in your elbow and lift your arm out to the side.',
      'Raise it until your arm is about level with your shoulder.',
      'Slowly lower it back down, resisting the pull of the cable.',
      'Finish all reps, then turn around and do the other side.',
    ],
  },
  'band-shoulder-press': {
    steps: [
      'Stand with both feet on the middle of the band, holding one end in each hand at shoulder height.',
      'Tighten your stomach and push both hands straight up above your head.',
      'Straighten your arms fully at the top.',
      'Slowly lower back down to shoulder height, keeping the band tight.',
      'Repeat for all reps.',
    ],
  },
  'machine-shoulder-press': {
    steps: [
      'Adjust the seat so the handles start at shoulder height.',
      'Sit with your back flat against the pad and grab the handles.',
      'Push the handles straight up until your arms are fully extended.',
      'Slowly bring them back down to the starting position.',
      'Keep your back against the pad the whole time.',
    ],
  },
  'pike-push-up': {
    steps: [
      'Start in an upside-down "V" shape — hands and feet on the floor, hips lifted high in the air.',
      'Bend your elbows to slowly lower the top of your head toward the floor.',
      'Keep your hips high the entire time.',
      'Push back up through your hands to the starting position.',
      'Repeat slowly and with control.',
    ],
  },

  // Biceps
  'dumbbell-bicep-curl': {
    steps: [
      'Stand holding a dumbbell in each hand, arms hanging straight down, palms facing forward.',
      'Keep your elbows pinned to your sides — they shouldn\'t move.',
      'Curl both dumbbells up toward your shoulders by bending your elbows.',
      'Squeeze your upper arms at the top.',
      'Slowly lower the dumbbells back down until your arms are straight.',
    ],
    tips: ['Avoid swinging your body to help lift the weight — let your arms do the work.'],
  },
  'hammer-curl': {
    steps: [
      'Stand holding a dumbbell in each hand with your palms facing your body (like you\'re holding two hammers).',
      'Keep your elbows pinned to your sides.',
      'Curl both dumbbells up toward your shoulders, keeping your palms facing inward the whole time.',
      'Squeeze at the top, then slowly lower back down.',
      'Repeat for all reps.',
    ],
  },
  'incline-dumbbell-curl': {
    steps: [
      'Sit back on a bench that\'s tilted up at about 45 degrees, arms hanging straight down.',
      'Hold a dumbbell in each hand, palms facing forward.',
      'Curl both dumbbells up toward your shoulders without moving your upper arms.',
      'Squeeze your arms at the top.',
      'Slowly lower back down until you feel a full stretch, then repeat.',
    ],
  },
  'concentration-curl': {
    steps: [
      'Sit on a bench with your legs spread apart, holding a dumbbell in one hand.',
      'Rest the back of your upper arm against the inside of your thigh.',
      'Curl the dumbbell up toward your shoulder, keeping your upper arm still.',
      'Squeeze at the top, then slowly lower it back down until your arm is straight.',
      'Finish all reps on one side, then switch hands.',
    ],
  },
  'alternating-dumbbell-curl': {
    steps: [
      'Stand holding a dumbbell in each hand, arms hanging straight down.',
      'Curl one dumbbell up toward your shoulder while the other stays down by your side.',
      'Squeeze at the top, then slowly lower that arm back down.',
      'Now do the same thing with your other arm.',
      'Keep switching arms until you finish all your reps.',
    ],
  },
  'barbell-curl': {
    steps: [
      'Stand holding a barbell with your palms facing up, hands shoulder-width apart.',
      'Keep your elbows pinned to your sides, arms hanging straight down.',
      'Curl the bar up toward your shoulders.',
      'Squeeze your arms at the top.',
      'Slowly lower the bar back down until your arms are straight.',
    ],
    tips: ['Don\'t lean back or use your hips to swing the bar up — that\'s cheating the movement.'],
  },
  'cable-bicep-curl': {
    steps: [
      'Stand facing a low cable machine with a bar attached.',
      'Grab the bar with your palms facing up, arms straight, elbows at your sides.',
      'Curl the bar up toward your shoulders, keeping your elbows still.',
      'Squeeze at the top, then slowly lower it back down.',
      'Repeat for all reps.',
    ],
  },
  'band-bicep-curl': {
    steps: [
      'Stand with both feet on the middle of the band, holding one end in each hand.',
      'Keep your elbows pinned to your sides, arms hanging down.',
      'Curl both hands up toward your shoulders.',
      'Squeeze at the top, then slowly lower back down, keeping the band tight.',
      'Repeat for all reps.',
    ],
  },

  // Triceps
  'tricep-dip': {
    steps: [
      'Hold onto parallel bars or the edge of a bench with your arms straight, supporting your body weight.',
      'Slowly bend your elbows to lower your body down.',
      'Keep your elbows pointing backward, not out to the sides.',
      'Push yourself back up through your hands until your arms are straight again.',
      'Repeat, keeping your body upright the whole time.',
    ],
  },
  'dumbbell-tricep-kickback': {
    steps: [
      'Bend forward at your hips holding a dumbbell in one hand, with your upper arm held level with your back.',
      'Keep your elbow bent at a right angle and close to your body.',
      'Straighten your arm backward until it\'s fully extended.',
      'Squeeze the back of your arm at the top, then bend your elbow back to start.',
      'Finish all reps on one side, then switch arms.',
    ],
  },
  'overhead-dumbbell-tricep-extension': {
    steps: [
      'Sit or stand holding one dumbbell with both hands above your head, arms straight.',
      'Keeping your upper arms still, bend your elbows to slowly lower the dumbbell behind your head.',
      'Lower it until your arms form roughly a right angle.',
      'Straighten your arms back up to the start, squeezing the back of your arms.',
      'Repeat for all reps.',
    ],
  },
  'cable-tricep-pushdown': {
    steps: [
      'Stand facing a cable machine with a bar or rope attached up high.',
      'Grab the attachment with your elbows pinned to your sides.',
      'Push the attachment down until your arms are fully straight.',
      'Squeeze the back of your arms at the bottom.',
      'Slowly let it rise back up, keeping your elbows still.',
    ],
  },
  'close-grip-bench-press': {
    steps: [
      'Lie on a flat bench and grip the bar with your hands close together, about shoulder-width apart.',
      'Lift the bar off the rack and hold it above your chest, arms straight.',
      'Slowly lower the bar down to your lower chest, keeping your elbows close to your body.',
      'Push the bar back up until your arms are straight.',
      'Repeat, going slow and controlled every time.',
    ],
  },
  'band-tricep-extension': {
    steps: [
      'Loop the band overhead or stand on it, holding one end in each hand behind your head.',
      'Keep your upper arms still and elbows pointing up.',
      'Straighten your arms up and out until they\'re fully extended.',
      'Squeeze the back of your arms at the top.',
      'Slowly bring your arms back down, keeping the band tight.',
    ],
  },
  'machine-tricep-extension': {
    steps: [
      'Sit at the machine and grab the handles, resting your elbows on the pad.',
      'Push the handles down until your arms are fully straight.',
      'Squeeze the back of your arms at the bottom.',
      'Slowly let the handles rise back up.',
      'Keep your elbows resting on the pad the whole time.',
    ],
  },

  // Forearms
  'dumbbell-wrist-curl': {
    steps: [
      'Sit down and rest your forearm on your leg or a bench, with your wrist hanging off the edge.',
      'Hold a dumbbell with your palm facing up.',
      'Curl your wrist upward, lifting the dumbbell as high as you can.',
      'Slowly lower it back down, letting your wrist bend all the way back.',
      'Repeat, then switch to the other arm.',
    ],
  },
  'barbell-wrist-curl': {
    steps: [
      'Sit down and rest both forearms on your legs or a bench, wrists hanging off the edge.',
      'Hold a barbell with your palms facing up.',
      'Curl your wrists upward, lifting the bar as high as possible.',
      'Slowly lower it back down, letting your wrists bend all the way back.',
      'Repeat for all reps.',
    ],
  },
  'kettlebell-farmers-carry': {
    steps: [
      'Stand up holding a heavy kettlebell in each hand, down by your sides.',
      'Keep your shoulders back, chest up, and stomach tight.',
      'Walk forward slowly and steadily for the set distance or time.',
      'Try not to let the kettlebells swing as you walk.',
      'Set them down gently and with control when you\'re done.',
    ],
  },
  'band-wrist-curl': {
    steps: [
      'Sit down and step on one end of the band, resting your forearm on your leg.',
      'Hold the other end with your palm facing up, wrist hanging off your knee.',
      'Curl your wrist upward against the band.',
      'Slowly lower it back down.',
      'Repeat, then switch to the other arm.',
    ],
  },
  'reverse-barbell-curl': {
    steps: [
      'Stand holding a barbell with your palms facing down, hands shoulder-width apart.',
      'Keep your elbows pinned to your sides, arms hanging straight.',
      'Curl the bar up toward your shoulders, keeping your palms facing down the whole time.',
      'Squeeze at the top, then slowly lower it back down.',
      'Repeat for all reps.',
    ],
  },

  // Legs
  'barbell-back-squat': {
    steps: [
      'Rest the bar across your upper back and shoulders, gripping it a little wider than your shoulders.',
      'Lift the bar off the rack and step back, feet about shoulder-width apart.',
      'Tighten your stomach and slowly bend your knees and hips to lower your body down, like sitting into a chair.',
      'Go down until your thighs are at least level with the floor.',
      'Push through your heels to stand back up.',
    ],
    tips: ['Keep your knees pointing the same direction as your toes as you go down.'],
  },
  'kettlebell-goblet-squat': {
    steps: [
      'Hold a kettlebell close to your chest with both hands, elbows pointing down.',
      'Stand with your feet a little wider than shoulder-width apart.',
      'Slowly bend your knees to squat down, keeping your chest up and the kettlebell close to your body.',
      'Go down until your thighs are at least level with the floor.',
      'Push through your heels to stand back up.',
    ],
  },
  'kettlebell-lunges': {
    steps: [
      'Stand holding a kettlebell in each hand (or one at your chest), feet hip-width apart.',
      'Step forward with one leg and slowly bend both knees until they\'re close to right angles.',
      'Make sure your front knee stays above your ankle, not out past your toes.',
      'Push through your front heel to stand back up.',
      'Switch legs and repeat.',
    ],
  },
  'kettlebell-romanian-deadlift': {
    steps: [
      'Stand holding a kettlebell in each hand in front of your thighs.',
      'Keep your knees slightly bent and slowly push your hips backward, leaning your chest forward.',
      'Lower the kettlebells down the front of your legs, keeping your back straight.',
      'Go down until you feel a stretch in the back of your legs, then reverse the motion.',
      'Push your hips forward to stand back up straight.',
    ],
  },
  'kettlebell-step-up': {
    steps: [
      'Stand facing a sturdy bench or box, holding a kettlebell in each hand.',
      'Place one foot flat on top of the bench.',
      'Push through that foot to step all the way up, bringing your other foot up too.',
      'Step back down slowly, leading with the same foot.',
      'Finish all reps, then switch which leg leads.',
    ],
  },
  'dumbbell-lunges': {
    steps: [
      'Stand holding a dumbbell in each hand by your sides, feet hip-width apart.',
      'Step forward with one leg and slowly bend both knees until they\'re close to right angles.',
      'Keep your upper body upright and your front knee above your ankle.',
      'Push through your front foot to stand back up.',
      'Switch legs and repeat.',
    ],
  },
  'leg-press': {
    steps: [
      'Sit in the machine with your feet shoulder-width apart on the platform in front of you.',
      'Release the safety bars and slowly bend your knees to lower the platform toward you.',
      'Lower it until your knees are close to right angles, keeping your back flat on the pad.',
      'Push through your heels to straighten your legs and push the platform back out.',
      'Don\'t lock your knees out hard at the top — keep a tiny bend.',
    ],
  },
  'bodyweight-squat': {
    steps: [
      'Stand with your feet shoulder-width apart, toes turned out slightly.',
      'Tighten your stomach and slowly bend your knees and hips to lower down, like sitting into a chair.',
      'Go down until your thighs are at least level with the floor.',
      'Push through your heels to stand back up.',
      'Keep your knees pointing the same direction as your toes the whole time.',
    ],
  },
  'band-squat': {
    steps: [
      'Stand with both feet on the middle of the band, holding the ends at your shoulders.',
      'Tighten your stomach and slowly squat down, keeping your chest up.',
      'Go down until your thighs are at least level with the floor.',
      'Push through your heels to stand back up against the band.',
      'Repeat for all reps.',
    ],
  },

  // Glutes
  'barbell-hip-thrust': {
    steps: [
      'Sit on the floor with your upper back leaning against a bench, a barbell resting over your hips.',
      'Plant your feet flat on the floor with your knees bent.',
      'Push your hips up toward the ceiling by squeezing your bottom, until your body forms a straight line.',
      'Pause and squeeze hard at the top.',
      'Slowly lower your hips back down and repeat.',
    ],
    tips: ['Put a folded towel or pad on the bar so it doesn\'t dig into your hips.'],
  },
  'kettlebell-swing': {
    steps: [
      'Stand with feet shoulder-width apart, kettlebell on the floor in front of you.',
      'Bend forward from your hips to grab the kettlebell with both hands.',
      'Swing it back between your legs, then drive your hips forward hard to swing it up.',
      'Let the swing take the kettlebell up to about chest height, arms straight.',
      'Let it swing back down between your legs and repeat the motion.',
    ],
    tips: ['The power comes from pushing your hips forward, not from lifting with your arms.'],
  },
  'glute-bridge': {
    steps: [
      'Lie on your back with your knees bent and feet flat on the floor, hip-width apart.',
      'Keep your arms flat on the floor by your sides.',
      'Push your hips up toward the ceiling by squeezing your bottom, until your body is in a straight line from shoulders to knees.',
      'Pause and squeeze at the top.',
      'Slowly lower your hips back down and repeat.',
    ],
  },
  'cable-glute-kickback': {
    steps: [
      'Attach a strap around one ankle, connected to a low cable machine.',
      'Face the machine and hold on for balance, standing on your other leg.',
      'Keeping your leg mostly straight, kick it backward and up by squeezing your bottom.',
      'Pause for a moment at the top.',
      'Slowly bring your leg back to the start, finish all reps, then switch legs.',
    ],
  },
  'band-glute-bridge': {
    steps: [
      'Lie on your back with knees bent, feet flat on the floor, and a band looped around your thighs.',
      'Keep your arms flat by your sides.',
      'Push your hips up while also pushing your knees outward against the band.',
      'Squeeze your bottom hard at the top.',
      'Slowly lower back down and repeat.',
    ],
  },
  'machine-hip-thrust': {
    steps: [
      'Sit in the machine with the pad resting across your hips.',
      'Plant your feet flat on the platform with your knees bent.',
      'Push your hips up by pressing through your heels and squeezing your bottom.',
      'Pause and squeeze at the top.',
      'Slowly lower back down and repeat.',
    ],
  },

  // Abs / Core
  plank: {
    steps: [
      'Get down on your forearms and toes, elbows directly under your shoulders.',
      'Stretch your legs out behind you, balancing on your toes.',
      'Keep your whole body in a straight line, from your head down to your heels.',
      'Tighten your stomach and squeeze your bottom so your hips don\'t sag down or point up.',
      'Hold this position for the target time, breathing normally.',
    ],
  },
  'hanging-leg-raise': {
    steps: [
      'Hang from a pull-up bar with your arms fully straight.',
      'Keeping your legs fairly straight, lift them up in front of you.',
      'Raise them until they\'re at least level with your hips.',
      'Slowly lower your legs back down — don\'t let them swing.',
      'Repeat for all reps.',
    ],
  },
  'cable-woodchopper': {
    steps: [
      'Set a cable machine handle up high and stand sideways to it.',
      'Grab the handle with both hands and pull it down and across your body in one motion.',
      'Finish with your hands near your opposite hip.',
      'Turn your whole body to do the movement, not just your arms.',
      'Slowly return to the start, finish all reps, then switch sides.',
    ],
  },
  'kettlebell-russian-twist': {
    steps: [
      'Sit on the floor with your knees bent, leaning back slightly so your stomach is working.',
      'Hold a kettlebell with both hands in front of your chest.',
      'Twist your body to bring the kettlebell to one side.',
      'Twist back through the middle to the other side.',
      'Keep going side to side for all reps.',
    ],
  },
  'dumbbell-side-bend': {
    steps: [
      'Stand holding a dumbbell in one hand by your side, your other hand on your hip.',
      'Keep facing forward the whole time.',
      'Slowly bend sideways at your waist, lowering the dumbbell toward your knee.',
      'Squeeze your side muscles to pull yourself back up straight.',
      'Finish all reps, then switch the dumbbell to your other hand.',
    ],
  },
  'band-pallof-press': {
    steps: [
      'Loop the band around something at chest height and stand sideways to it.',
      'Hold the band with both hands at your chest, stepping away until it feels tight.',
      'Push the band straight out in front of you, resisting its pull to the side.',
      'Hold for a moment with your arms fully out.',
      'Bring it back to your chest, then repeat before switching sides.',
    ],
  },
  'machine-ab-crunch': {
    steps: [
      'Sit in the machine and grab the handles, with the pad resting on your upper chest.',
      'Tighten your stomach and pull the pad down toward your hips by curling forward.',
      'Squeeze your stomach at the bottom of the movement.',
      'Slowly return to the starting position.',
      'Repeat for all reps.',
    ],
  },

  // Calves
  'standing-barbell-calf-raise': {
    steps: [
      'Stand with the bar resting across your upper back, feet shoulder-width apart.',
      'Keep your legs straight but not locked.',
      'Rise up onto your tiptoes as high as you can.',
      'Squeeze your calves at the top.',
      'Slowly lower your heels back down below where you started.',
    ],
  },
  'dumbbell-calf-raise': {
    steps: [
      'Stand holding a dumbbell in each hand by your sides, feet shoulder-width apart.',
      'Rise up onto your tiptoes as high as you can.',
      'Squeeze your calves at the top.',
      'Slowly lower your heels back down, feeling a stretch.',
      'Repeat for all reps.',
    ],
  },
  'bodyweight-calf-raise': {
    steps: [
      'Stand with your feet shoulder-width apart. Hold onto a wall or rail if you need balance.',
      'Rise up onto your tiptoes as high as you can.',
      'Squeeze your calves at the top.',
      'Slowly lower your heels back down below where you started.',
      'Repeat for all reps.',
    ],
  },
  'machine-calf-raise': {
    steps: [
      'Get into the machine with the pads on your shoulders and the balls of your feet on the platform.',
      'Rise up onto your toes as high as you can.',
      'Squeeze your calves at the top.',
      'Slowly lower your heels back down below the edge of the platform.',
      'Repeat for all reps.',
    ],
  },
  'band-calf-raise': {
    steps: [
      'Stand with both feet on the middle of the band, holding the ends up at your shoulders.',
      'Rise up onto your tiptoes as high as you can.',
      'Squeeze your calves at the top.',
      'Slowly lower your heels back down against the band.',
      'Repeat for all reps.',
    ],
  },
};
