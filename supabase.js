const supabaseUrl =
"https://rapmmpscskwddvlvcpei.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcG1tcHNjc2t3ZGR2bHZjcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTExMTcsImV4cCI6MjEwMDgyNzExN30.Fd2NmjkKsP19pJiM5Ba72IHAKTLRn0VHzADVG7CqBNg";

const db = supabase.createClient(
    supabaseUrl,
    supabaseKey
);
