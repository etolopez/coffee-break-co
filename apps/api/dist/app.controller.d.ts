export declare class AppController {
    getRoot(): {
        message: string;
        version: string;
        status: string;
        timestamp: string;
        endpoints: {
            root: string;
            health: string;
            capture: string;
            coffees: string;
            sellers: string;
        };
    };
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
}
//# sourceMappingURL=app.controller.d.ts.map