export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio: string;
}


export interface RegisterResponse{
        message: string
    }