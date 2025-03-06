# Airtable Authentication Notes

## Personal Access Token vs API Key

This application uses Airtable's **Personal Access Token** for authentication, not the legacy API Key method.

### Important Implementation Details

1. **Environment Variable**: The application expects a personal access token in the `NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN` environment variable.

2. **Airtable Library Usage**: The Airtable JavaScript library still uses the parameter name `apiKey` when initializing the client, even when you're providing a personal access token. This is just a parameter name in the library and doesn't affect the authentication method:

   ```typescript
   // This is using a personal access token, despite the parameter name being apiKey
   base = new Airtable({ apiKey: personalAccessToken }).base(baseId as string);
   ```

### Setup Instructions

1. Generate a personal access token in your Airtable account:
   - Go to your [Airtable account page](https://airtable.com/account)
   - Navigate to the "Developer hub" section
   - Create a new personal access token with appropriate scopes (typically data.records:read and data.records:write)

2. Add your personal access token to the environment:
   - **Interactive configuration**: The Ubuntu deployment script will prompt you to enter your credentials during setup
   - **Manual configuration**:
     - In development: Add to your `.env.local` file
     - In production: Configure in your systemd service file or environment variables

### Environment Variables

```
NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=your_personal_access_token_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=120
```

### References

- [Airtable Personal Access Token Documentation](https://airtable.com/developers/web/api/personal-access-tokens)
- [Migrating from API Keys to Personal Access Tokens](https://airtable.com/developers/web/api/oauth-reference#personal-access-tokens) 