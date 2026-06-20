import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://paibpwwszlfpsyytdnal.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImUzOGRiMjYzLWRhNjctNGMyYi1hZTRjLWEzNTRmOWRlYjRhNCJ9.eyJwcm9qZWN0SWQiOiJwYWlicHd3c3psZnBzeXl0ZG5hbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4ODQwNzE0LCJleHAiOjIwODQyMDA3MTQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.DDKtu48q2M4cAEfdnFqD0SQoXR_ZycL62CRx59zqcUY';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };