declare global {
    interface User {
        id: number;
        email: string;
        full_name: string;
        roles: string[];
    }
}
