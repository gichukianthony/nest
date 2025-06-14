# Service Management System

A NestJS-based service management system for mechanics and service providers.

## Features

- User Management
- Mechanic Management
- Service Management
- Feedback System
- Rate Limiting
- Request Logging

## Database Relationships

### 1. User and Mechanic (Many-to-One)
```typescript
// In Mechanic entity
@ManyToOne(() => User, (user) => user.mechanics, { nullable: true })
user: Relation<User>;

// In User entity
@OneToMany(() => Mechanic, (mechanic) => mechanic.user)
mechanics: Relation<Mechanic[]>;
```
- A User can have multiple Mechanics
- A Mechanic belongs to one User
- The relationship is nullable (Mechanic can exist without a User)

### 2. Mechanic and Feedback (One-to-Many)
```typescript
// In Mechanic entity
@OneToMany(() => Feedback, (feedback) => feedback.mechanic)
feedbacks: Relation<Feedback[]>;

// In Feedback entity
@ManyToOne(() => Mechanic, { onDelete: 'CASCADE', nullable: true })
@JoinColumn({ name: 'mechanicId' })
mechanic: Relation<Mechanic>;
```
- A Mechanic can have multiple Feedbacks
- A Feedback belongs to one Mechanic
- Cascading delete: When a Mechanic is deleted, all their Feedbacks are deleted

### 3. Service and ServiceCategory (One-to-One)
```typescript
// In Service entity
@OneToOne(() => ServiceCategory, (category) => category.service)
@JoinColumn({ name: 'category_id' })
category: Relation<ServiceCategory>;

// In ServiceCategory entity
@OneToOne(() => Service, (service) => service.category)
service: Relation<Service>;
```
- A Service has one Category
- A Category belongs to one Service
- Foreign key is stored in the Service table

### 4. Service and Mechanic (Many-to-Many)
```typescript
// In Service entity
@ManyToMany(() => Mechanic, (mechanic) => mechanic.services)
@JoinTable({
    name: 'mechanic_services',
    joinColumn: {
        name: 'service_id',
        referencedColumnName: 'id',
    },
    inverseJoinColumn: {
        name: 'mechanic_id',
        referencedColumnName: 'id',
    },
})
mechanics: Relation<Mechanic[]>;

// In Mechanic entity
@ManyToMany(() => Service, (service) => service.mechanics)
services: Relation<Service[]>;
```
- A Service can be provided by multiple Mechanics
- A Mechanic can provide multiple Services
- Uses a join table `mechanic_services`

## Middleware Implementation

### 1. Rate Limiter Middleware
```typescript
@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const ip: string = (req.ip || req.connection.remoteAddress || 'unknown') as string;

    if (this.rateLimiterService.isBlocked(ip)) {
      const blockExpiry: number | null = this.rateLimiterService.getBlockExpiry(ip);
      const timeLeft: number = blockExpiry ? Math.ceil((blockExpiry - Date.now()) / 1000) : 0;
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. IP blocked. Try again in ${timeLeft} seconds.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const { blocked, remaining } = this.rateLimiterService.increment(ip);
    // ... rest of the implementation
  }
}
```
Features:
- Limits requests to 5 per minute per IP
- Blocks IP for 1 hour after exceeding limit
- Provides remaining attempts in response headers
- Detailed error messages with block duration

### 2. Logger Middleware
```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    // ... logging implementation
    console.log(
      `📥 ${yellow}${new Date().toISOString()}${reset} ${methodColor}${req.method}${reset} ${bold}${req.originalUrl}${reset}`,
    );
    // ... response logging
  }
}
```
Features:
- Logs all incoming requests
- Tracks request duration
- Color-coded output for better visibility
- Logs response status and timing

## Setup and Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
PG_HOST=localhost
PG_PORT=5432
PG_USERNAME=postgres
PG_PASSWORD=your_password
PG_DATABASE=nest
PG_SYNC=true
PG_LOGGING=false
```

4. Start the application:
```bash
npm run start:dev
```

## API Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Mechanics
- `POST /mechanics` - Create a new mechanic
- `GET /mechanics` - Get all mechanics
- `GET /mechanics/:id` - Get mechanic by ID
- `PUT /mechanics/:id` - Update mechanic
- `DELETE /mechanics/:id` - Delete mechanic

### Services
- `POST /services` - Create a new service
- `GET /services` - Get all services
- `GET /services/:id` - Get service by ID
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

### Feedbacks
- `POST /feedbacks` - Create a new feedback
- `GET /feedbacks` - Get all feedbacks
- `GET /feedbacks/:id` - Get feedback by ID
- `PUT /feedbacks/:id` - Update feedback
- `DELETE /feedbacks/:id` - Delete feedback

## Rate Limiting

The API implements rate limiting with the following rules:
- 5 requests per minute per IP
- 1-hour block after exceeding limit
- Headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests

## Error Handling

The system implements comprehensive error handling:
- HTTP exceptions for common errors
- Detailed error messages
- Proper status codes
- Rate limit error responses
- Database error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
