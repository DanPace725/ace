Implement an in-app economy system that extends the existing ACE task/reward framework.

The goal is to make responsibility, shared spaces, delayed action, and invisible labor visible in a kid-friendly way. This should not feel punitive or transactional. It should teach that actions have time-based effects: maintaining something creates value, avoiding something creates cost, and shared spaces affect everyone.

Core concept:

Each managed profile can have an in-app currency account separate from XP. XP represents long-term growth and should generally only increase. Currency represents short-term responsibility, tradeoffs, rewards, costs, and stewardship, so it can increase or decrease.

Add the concept of rooms or shared spaces. A room can have a state such as clean, needs attention, messy, or critical. The room has an account/balance and can gain or lose currency over time depending on its state.

Clean rooms generate positive value over time. Messy rooms create a time-based cost. This should visually update in real time, like a live counter, so kids can see compound-interest-style effects both ways.

Add responsibility assignment. When a room or room-related task is assigned to a managed profile, that profile becomes responsible for the room/task. While assigned and unresolved, delay cost can accrue against that profile. Positive interest should not begin until the task is completed and approved, so the system cannot be gamed by delaying completion after accepting responsibility.

When a profile completes an assigned room task:
- The task can still award XP normally.
- The currency outcome depends on timing, state, and admin approval.
- Completing faster can preserve or improve the currency reward.
- Waiting longer can reduce the reward or create a small cost.
- Once approved as clean, positive maintenance interest can begin.

Add a house/shared account concept. Shared rooms can affect the house account. If shared spaces stay clean, the house account can gain value and possibly distribute small dividends to profiles. If shared spaces are messy, the house account can lose value. This should teach that shared life has shared benefits and shared costs without turning family members into scorekeepers against each other.

Avoid making this a direct peer-to-peer transaction system. Do not make children charge each other or score each other. If someone else has to step in and clean or resolve a task, represent that as an admin-controlled rescue or assistance event. The cost should reflect that invisible labor was required, but it should stay bounded and humane.

Possible event concepts:
- task reward
- maintenance interest
- delay cost
- messiness tax
- house dividend
- rescue/assistance cost
- admin adjustment
- forgiveness/reset

Design principles:
- The system should make invisible costs visible without shaming the child.
- A profile is never bad; a state or unresolved responsibility can be costly.
- Always show a clear repair path.
- Negative effects should be capped or configurable.
- Admin override/reset/forgiveness should always be available.
- Positive reinforcement should remain central.
- The system should teach responsibility, stewardship, and financial literacy, not create a punishment economy.

Suggested language:
Use “coins,” “credits,” or “currency,” not real money unless explicitly configured.
Use terms like “room account,” “house account,” “interest,” “dividend,” “messiness tax,” “delay cost,” “rescue event,” and “maintenance bonus.”
Keep the kid-facing UI friendly: “This room is leaking coins,” “Clean it to stop the leak,” “Keep it clean to earn interest,” “The house is earning today,” etc.

Implementation should fit naturally into the existing app patterns: managed profiles, tasks/actions, admin review, rewards, XP, and dashboard views.