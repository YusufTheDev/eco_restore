export default {
    template: `
        <div style="background-color: white; color: black; padding: 40px; min-height: 100vh; width: 100%; border: 10px solid green;">
            <h1 style="font-size: 32px;">CARBON DASHBOARD IS LIVE</h1>
            <p style="font-size: 64px; font-weight: bold;">75.0 kg</p>
        </div>
    `,
    setup() {
        console.log("CarbonDashboard is active!");
        return {};
    }
}