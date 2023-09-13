# Episode Creation Request

## Show Theme: House M.D.

Generate an episode script based on the popular medical drama series, "House M.D.". The primary focus should be on Dr. Gregory House and his diagnostic team, with their unique personalities and interactions.

## Requirements

- Episode duration must be 2 minutes long
- Only one character can speak at a time
- A character cannot be on the same node at a time
- A character can either start off the screen, invisible, or be visible at a node already
- Movements of characters should be realistic. For instance, they shouldn't suddenly jump from one end of the scene to the other
- Make all the characters have the same personality that they have on the show, for example make House a genius, sarcastic, direct, and mean
- Try To make the episode sound and feel like a House MD episode
- The dynamic between Dr. House and Dr. Wilson should be highlighted
- Include moments of tension, mystery, and revelation as the team unravels the medical mystery
- Use medical terminologies accurately
- The duration on dialogues should be accurate how long it would actually take to say that
- Make sure the episode timelime flows right. After one event is done, it should go right to the next. No pause in between
- All characters in a scene MUST be defined in the intial state. A character cannot just suddenly appear if they are not defined in the initial state
- When changing to a new scene, you DO NOT call a scene action_type of scene just to fade out or whatever, The action type would just be fade and it would take care of it. So don't call it twice in consecutive order
- The last events timestamp and duration must add up to the episode total duration
- Scene Transitions: Each scene transition should only be mentioned once. Avoid repetitive transitions to the same scene (e.g., do not fade out and then fade back into the same scene). Transition to a new scene directly.
- Single Action Events: Each timestamp in the timeline should represent a single, distinct action. This provides clarity and ensures each action receives the appropriate focus and duration in the narrative.
- Overlapping Durations: While each timestamp represents a single action, the duration of an action can extend beyond the next timestamp. This allows for the simulation of simultaneous events or actions that continue in the background of other events. For example, a character might start talking at timestamp 10 with a duration of 5 seconds, but another character might start a movement at timestamp 12. This would represent the second character moving while the first character is still speaking.
- Isolated Major Events: Events like scene transitions and significant plot points should always have their own timestamp to ensure they stand out and are not overshadowed by other actions.
- Complete InitialState Data: For each scene's initialState, every character listed, whether visible or not, must have a defined position (startX, startY, scale, and rotation). If a character is initially invisible or off-screen but will be used later in the scene, they should still have a position set in the initialState.
- Direct Scene Introduction: If a character is intended to be on screen at the beginning of a scene, they should be set as "visible": true in the initialState of the scene. Do not use the "appear" action immediately after a scene transition to introduce characters that are meant to be present from the start of the scene. Instead, make them visible by default using the initialState.

## Topic

By default the episode should revolve around a rare and challenging medical case unless the user specifys otherwise.

## Characters

These are the only available characters to use: House, Cuddy, Wilson, Chase, Cameron, and a Patient. You don't have to use all the characters. They are just avaliable to use. However, House must always be in the script and the patient must be in the script.

## Scenes/Nodes

These are the nodes you MUST follow for the characters. When the node has ONLY that means only that character is allowed to be on that node

1. Hallway Scene:

Node 1: (x: 774.9, y: 707.3, scale: 0.6)
Node 2: (x: 677.7, y: 538.8, scale: 0.2)
Node 3: (x: 531.3, y: 709.3, scale: 0.6)
Node 4: (x: 310.0, y: 554.2, scale: 0.4)
Node 5: (x: 97.0, y: 671.0, scale: 0.5)

2. Hospital Room Scene:

Node 1: (x: 155.7, y: 495.9, scale: 0.35, rotation: 0)
Node 2: (x: 342.5, y: 472.5, scale: 0.25, rotation: 0)
Node 3: (x: 532.8, y: 449.7, scale: 0.35, rotation: 0)
Node 4: (x: 279.0, y: 775.2, scale: 0.4, rotation: 0)
Node 5: (x: 722.4, y: 750.6, scale: 0.4, rotation: 0)
Node 6: (x: 910, y: 515.8, scale: 0.25, rotation: 50) Only for the patient.

3. Meeting Scene:

Node 1: (x: 809.9, y: 561.3, scale: 0.6)
Node 2: (x: 687.7, y: 342.8, scale: 0.2)
Node 3: (x: 584.3, y: 627.3, scale: 0.6)
Node 4: (x: 326.5, y: 344.7, scale: 0.3)
Node 5: (x: 153.0, y: 516.0, scale: 0.5)

4. MRI Scene:

Node 1: (x: 892.9, y: 435.3, scale: 0.6, rotation: 0)
Node 2: (x: 725.1, y: 370.1, scale: 0.35, rotation: 0)
Node 3: (x: 400.7, y: 400.8, scale: 0.45, rotation: 290) Only for the patient.
Node 4: (x: 102.8, y: 478.0, scale: 0.55, rotation: 0)

5. Office Scene:

Node 1: (x: 847.9, y: 644.3, scale: 0.6)
Node 2: (x: 699.5, y: 514.7, scale: 0.3)
Node 3: (x: 530.0, y: 669.0, scale: 0.5)
Node 4: (x: 324.4, y: 667.9, scale: 0.7)
Node 5: (x: 98.4, y: 520.6, scale: 0.4)

6. OR Scene:

Node 1: (x: 149.3, y: 709.3, scale: 0.6)
Node 2: (x: 845.9, y: 716.3, scale: 0.6)
Node 3: (x: 550.0, y: 707.5, scale: 0.5, rotation: 60) Only for the patient.

## Structure

The script will be structured in the following way:

title: This is the name of the episode. It should be catchy and relevant to the episode's theme.

description: This is the description of the episode.

duration: This is the total runtime of the episode in seconds. For instance, 300 seconds mean the episode is 5 minutes long.

all_scenes: A list of all the places or settings that will be shown in this episode.

all_characters: A list of all the characters that will appear in this episode.

timeline: This is a list detailing what happens at specific times in the episode. Each event in the timeline has:

-timestamp: The time (in seconds) when the event starts.
-action: What is happening at that timestamp. The action has an action_type which can be one of the following:
--appear: A character comes into the scene.
--talk: A character says something. This action will also have a dialogue detailing what the character says.
--move: A character moves to a new location on the screen. This action will also have details about the start and end position of the movement.
--rotate: A character rotates to a specific angle.
--scene: The scene or setting changes.

Detailed Breakdown of Action Types

1. appear:
   When a character first enters the scene or becomes visible.

character: The name of the character that is appearing.
action_type: Should be set to "appear".
duration: Duration in seconds for how long this action takes.

2. talk:
   When a character speaks.

character: The name of the character that is speaking.
action_type: Should be set to "talk".
dialogue: The content of what the character says. This could be a single sentence or multiple sentences.
duration: Duration in seconds for how long this dialogue will be displayed or spoken.

3. move:
   Represents a character moving from one spot to another.

character: The name of the character that is moving.
action_type: Should be set to "move".
position: Details about the movement:
startX: The starting horizontal position (x-coordinate).
startY: The starting vertical position (y-coordinate).
endX: The ending horizontal position (x-coordinate).
endY: The ending vertical position (y-coordinate).
scale: The size scale of the character during the movement. For instance, 1 is full size, 0.5 is half size.
rotation: The rotation angle of the character during the movement, in degrees.

4. rotate:
   When a character rotates to a specific angle.

character: The name of the character that is rotating.
action_type: Should be set to "rotate".
rotation: The angle in degrees to which the character should rotate.

5. scene:
   Represents a change in the scene or setting.

action_type: Must be set to "scene".
scene: The name of the new scene or setting.
transition_effect: The visual effect to use when transitioning from one scene to another. Examples include "fade", "slide", "wipe", etc.
duration: Duration in seconds for how long the transition effect takes.
initialState: This represents the initial positions, scales, rotations, and visibility of all characters in the new scene. It should be structured as follows:
characters: An array of characters with their attributes:
name: The name of the character.
visible: A boolean indicating if the character is visible or not.
position: An object describing the character's position, scale, and rotation:
startX: The horizontal position (x-coordinate).
startY: The vertical position (y-coordinate).
scale: The size scale of the character. For instance, 1 is full size, 0.5 is half size.
rotation: The rotation angle of the character, in degrees.

## Output

ONLY A JSON OBJECT NOTHING ELSE. DO NOT PUT IN CODE BLOCK. ALSO MAKE SURE THAT THE LAST TIMESTAMP + DURATION ADDS UP TO 120!
