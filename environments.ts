const environments = {
    production: {
        baseURL: "https://automationintesting.online/",
        apiURL: "https://automationintesting.online/api",
        users: {
            admin: {
                Username: process.env.ADMIN_USER!,
                Password: process.env.ADMIN_PASSWORD!,
            },  
    
        },
    },
    local: {
        baseURL: "http://localhost:8080/",
        apiURL: "http://localhost:3000/api",
        users: {
            admin: {
                Username: process.env.ADMIN_USER!,
                Password: process.env.ADMIN_PASSWORD!,
            },  
    
        },
    },
}

type EnvName = keyof typeof environments;

const envName = (process.env.ENV || "production") as EnvName;

if (!environments[envName]) {
  throw new Error(
    `Unknown environment: ${envName}. Valid options: ${Object.keys(environments).join(", ")}`,
  );
}

export const env = environments[envName];