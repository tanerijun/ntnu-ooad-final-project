## **Singleton Pattern**

### **Intent**

Ensure a class has only one instance and provide a global point of access to it. In the project, this manages the global state of tags across the frontend application.

### **Related Structure (Class Diagram)**

```
Class Diagram: Singleton Pattern Structure

class TagManager {
    <<singleton>>
    -instance: TagManager {static}
    -listeners: Set<TagEventListener>
    -tags: StoredTag[]
    -isLoaded: boolean

    -TagManager()
    +getInstance(): TagManager {static}
    +addListener(listener: TagEventListener): void
    +removeListener(listener: TagEventListener): void
    +addTag(tagName: string): Promise<StoredTag>
    +getAllTags(): StoredTag[]
    +refresh(): Promise<void>
    +clear(): void
    -loadFromDatabase(): Promise<void>
    -notifyListeners(): void
}

interface TagEventListener {
    +onTagsUpdated(tags: StoredTag[]): void
}

class StoredTag {
    +name: string
    +slug: string
    +createdAt: string
}

TagManager --> "*" TagEventListener : notifies
TagManager --> "*" StoredTag : manages
TagManager --> TagsClient : uses
```

### **Implementation Evidence**

```ooad-final/frontend/src/lib/tags/storage.ts#L15-30
export class TagManager {
  private static instance: TagManager;
  private listeners: Set<TagEventListener> = new Set<TagEventListener>();
  private tags: StoredTag[] = [];
  private isLoaded = false;

  private constructor() {
    void this.loadFromDatabase();
  }

  public static getInstance(): TagManager {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager();
    }
    return TagManager.instance;
  }
```

### **Consequences**

**Positive Consequences:**

1. **Global State Management**: Ensures consistent tag state across all components
2. **Memory Efficiency**: Only one instance exists, preventing memory waste
3. **Centralized Control**: Single point for tag operations and synchronization
4. **Event Coordination**: Centralized listener management for tag updates

**Negative Consequences:**

1. **Global State Coupling**: Components become dependent on global state

---

## **Service Layer Pattern**

### **Intent**

Define an application's boundary with a layer of services that establishes a set of available operations and coordinates the application's response in each operation. This encapsulates business logic and provides a uniform interface to the domain.

### **Related Structure (Class Diagram)**

```
Class Diagram: Service Layer Pattern Structure

abstract class BaseService {
    #handleError(error: any, defaultMessage: string): void
}

class AuthService {
    +createUser(data: any): Promise<AccessToken>
    +authenticateUser(email: string, password: string): Promise<AccessToken>
    +logoutUser(user: User): Promise<void>
    +updateUserProfile(user: User, data: any): Promise<User>
    +updateUserPassword(user: User, currentPassword: string, newPassword: string): Promise<void>
    +updateUserAvatar(user: User, avatar: MultipartFile): Promise<object>
}

class NotesService {
    +getUserNotes(userId: number): Promise<Note[]>
    +searchNotes(userId: number, query: string): Promise<Note[]>
    +createNote(userId: number, title: string, content: string, tagNames: string[]): Promise<Note>
    +updateNote(noteId: number, userId: number, data: any): Promise<Note>
    +deleteNote(noteId: number, userId: number): Promise<void>
    -findOrCreateTags(tagNames: string[]): Promise<number[]>
}

class TimerService {
    +getTimerSessions(userId: number, date?: string, subject?: string): Promise<TimerSession[]>
    +createTimerSession(data: any): Promise<TimerSession>
    +updateTimerSession(sessionId: number, data: any): Promise<TimerSession>
    +getUserTasks(userId: number): Promise<TimerSession[]>
    +createUserTaskSetting(data: any): Promise<object>
    -updateUserTaskSettings(userId: number, oldSubject: string, newSubject: string): Promise<void>
}

class AuthController {
    -authService: AuthService
    +register(context: HttpContext): Promise<AccessToken>
    +login(context: HttpContext): Promise<AccessToken>
    +updateProfile(context: HttpContext): Promise<object>
}

class NotesController {
    -notesService: NotesService
    +index(context: HttpContext): Promise<Note[]>
    +store(context: HttpContext): Promise<Note>
    +update(context: HttpContext): Promise<Note>
}

class TimerSessionsController {
    -timerService: TimerService
    +index(context: HttpContext): Promise<TimerSession[]>
    +store(context: HttpContext): Promise<TimerSession>
}

BaseService <|-- AuthService
BaseService <|-- NotesService
BaseService <|-- TimerService
AuthController --> AuthService : uses
NotesController --> NotesService : uses
TimerSessionsController --> TimerService : uses
```

### **Implementation Evidence**

**Base Service Class:**

```ooad-final/backend/app/services/base_service.ts#L1-5
export default abstract class BaseService {
  protected handleError(error: any, defaultMessage: string) {
    console.error(error)
    throw new Error(defaultMessage)
  }
}
```

**Service Implementation:**

```ooad-final/backend/app/services/notes_service.ts#L4-20
export default class NotesService extends BaseService {
  async getUserNotes(userId: number) {
    return await Note.query().where('userId', userId).preload('tags').orderBy('updatedAt', 'desc')
  }

  async createNote(userId: number, title: string | null, content: string, tagNames: string[] = []) {
    const note = await Note.create({ title, content, userId })

    if (tagNames.length > 0) {
      const tagIds = await this.findOrCreateTags(tagNames)
      await note.related('tags').sync(tagIds)
    }

    await note.load('tags')
    return note
  }
```

**Controller Using Service:**

```ooad-final/backend/app/controllers/notes_controller.ts#L4-15
export default class NotesController {
  private notesService = new NotesService()

  async index({ auth }: HttpContext) {
    await auth.check()
    return await this.notesService.getUserNotes(auth.user!.id)
  }

  async store({ request, auth }: HttpContext) {
    await auth.check()
    const title = request.input('title') || null
    const content = request.input('content') || ''
    const tagNames: string[] = request.input('tags') || []

    return await this.notesService.createNote(auth.user!.id, title, content, tagNames)
  }
```

### **Consequences**

**Positive Consequences:**

1. **Business Logic Encapsulation**: Complex operations like `findOrCreateTags` are encapsulated in services
2. **Reusability**: Services can be used by multiple controllers or other services
3. **Testability**: Business logic can be tested independently of HTTP concerns
4. **Separation of Concerns**: Controllers handle HTTP, services handle business logic
5. **Consistency**: Common error handling through `BaseService`

**Negative Consequences:**

1. **Additional Complexity**: Extra layer between controllers and models
2. **Potential Over-Engineering**: Simple CRUD operations might not need service layer
3. **Dependency Management**: Controllers depend on services, requiring careful instantiation

---

## **Observer Pattern**

### **Intent**

Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically. In the project, this manages tag update notifications across UI components.

### **Related Structure (Class Diagram)**

```
Class Diagram: Observer Pattern Structure

interface TagEventListener {
    +onTagsUpdated(tags: StoredTag[]): void
}

class TagManager {
    -listeners: Set<TagEventListener>
    -tags: StoredTag[]

    +addListener(listener: TagEventListener): void
    +removeListener(listener: TagEventListener): void
    +addTag(tagName: string): Promise<StoredTag>
    +removeTag(tagName: string): Promise<boolean>
    -notifyListeners(): void
    -loadFromDatabase(): Promise<void>
}

class UIComponent1 {
    +onTagsUpdated(tags: StoredTag[]): void
    +componentDidMount(): void
    +componentWillUnmount(): void
}

class UIComponent2 {
    +onTagsUpdated(tags: StoredTag[]): void
    +componentDidMount(): void
    +componentWillUnmount(): void
}

TagEventListener <|.. UIComponent1
TagEventListener <|.. UIComponent2
TagManager --> "*" TagEventListener : notifies
TagManager --> "*" StoredTag : manages
```

### **Implementation Evidence**

**Observer Interface:**

```ooad-final/frontend/src/lib/tags/storage.ts#L8-10
export interface TagEventListener {
  onTagsUpdated: (tags: StoredTag[]) => void;
}
```

**Subject (Observable) Implementation:**

```ooad-final/frontend/src/lib/tags/storage.ts#L27-50
  public addListener(listener: TagEventListener): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: TagEventListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener.onTagsUpdated([...this.tags]);
      } catch (error) {
        logger.error('Error notifying tag listener:', error);
      }
    });

    window.dispatchEvent(
      new CustomEvent('tagsUpdated', {
        detail: { tags: [...this.tags] },
      })
    );
  }
```

**Notification Trigger:**

```ooad-final/frontend/src/lib/tags/storage.ts#L65-75
  private async loadFromDatabase(): Promise<void> {
    try {
      const dbTags = await tagsClient.getAll();
      this.tags = dbTags.map((tag) => ({
        name: tag.name,
        slug: this.createSlug(tag.name),
        createdAt: new Date().toISOString(),
      }));
      this.isLoaded = true;
      this.notifyListeners();
    } catch (error) {
      logger.error('Failed to load tags from database:', error);
      this.tags = [];
      this.isLoaded = true;
    }
  }
```

### **Consequences**

**Positive Consequences:**

1. **Loose Coupling**: UI components don't need direct references to each other
2. **Dynamic Relationships**: Components can subscribe/unsubscribe at runtime
3. **Broadcast Communication**: One tag change updates all interested components
4. **Extensibility**: New components can easily observe tag changes without modifying existing code

**Negative Consequences:**

1. **Memory Leaks**: If listeners aren't properly removed, memory leaks can occur
2. **Performance**: Notifying many observers can be expensive

---

## **Facade Pattern**

### **Intent**

Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use. In the project, API clients act as facades to complex HTTP operations.

### **Related Structure (Class Diagram)**

```
Class Diagram: Facade Pattern Structure

class ApiClient {
    -baseUrl: string

    +get<T>(endpoint: string, options?: FetchOptions): Promise<T>
    +post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T>
    +put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T>
    +delete<T>(endpoint: string, options?: FetchOptions): Promise<T>
    -getHeaders(data?: unknown): HeadersInit
    -buildUrl(endpoint: string, params?: Record): string
    -request<T>(method: HttpMethod, endpoint: string, options?: FetchOptions): Promise<T>
}

class AuthClient {
    +signUp(params: SignUpParams): Promise<object>
    +signInWithPassword(params: SignInWithPasswordParams): Promise<object>
    +getUser(): Promise<object>
    +updateProfile(data: object): Promise<object>
}

class NotesClient {
    +create(title?: string, tags?: string[]): Promise<Note>
    +getAll(): Promise<Note[]>
    +search(query: string): Promise<Note[]>
    +update(id: number, title: string, content: string, tags?: string[]): Promise<Note>
    +delete(id: number): Promise<boolean>
}

class ComplexHTTPSubsystem {
    <<subsystem>>
    +fetch()
    +localStorage
    +URLSearchParams
    +JSON.stringify()
    +JSON.parse()
    +Error handling
    +Authentication headers
    +Request/Response transformation
}

AuthClient --> ApiClient : uses
NotesClient --> ApiClient : uses
ApiClient --> ComplexHTTPSubsystem : simplifies access to
```

### **Implementation Evidence**

**Facade Implementation:**

```ooad-final/frontend/src/lib/api/client.ts#L15-60
class ApiClient {
  private baseUrl: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined');
    }
    this.baseUrl = baseUrl;
  }

  private getHeaders(data?: unknown): HeadersInit {
    const headers: HeadersInit = {};

    const token = localStorage.getItem('access-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Only set Content-Type if not sending FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private async request<T>(method: HttpMethod, endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, data, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const headers = this.getHeaders(data);

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
```

**Client Using Facade:**

```ooad-final/frontend/src/lib/auth/client.ts#L30-40
class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    try {
      const data = await apiClient.post<AuthResponse>('/register', params);
      localStorage.setItem('access-token', data.token);
      return {};
    } catch (error) {
      logger.error('Registration error:', error);
      return { error: 'Registration failed' };
    }
  }
```

### **Consequences**

**Positive Consequences:**

1. **Simplified Interface**: Complex HTTP operations reduced to simple method calls
2. **Centralized Configuration**: Authentication, base URL, headers managed in one place
3. **Consistent Error Handling**: Uniform error handling across all API calls
4. **Type Safety**: Generic types provide compile-time type checking
5. **Code Reuse**: Multiple clients use the same underlying HTTP functionality

**Negative Consequences:**

1. **Limited Flexibility**: Facade might not expose all underlying functionality
2. **Performance Overhead**: Additional abstraction layer
3. **Dependency**: All clients depend on the facade implementation
