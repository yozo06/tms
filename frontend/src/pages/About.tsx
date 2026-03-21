import React from 'react'

export default function About() {
    return (
        <div className="px-4 pt-12 pb-24 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">The WildArc Vision</h1>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-forest-700 mb-2">Permaculture & Regenerative Design</h2>
                        <p>
                            Welcome to the digitized heart of the WildArc project. We are building more than a farm tracker; we are cultivating a data-driven model for regenerative permaculture rooted in Coorg.
                            Our vision is to build a self-sustaining and intensely productive ecosystem that operates harmoniously with nature.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-forest-700 mb-2">An Educational Model</h2>
                        <p>
                            Every data point collected—every tree tagged, every health check, every yield logged—contributes to a larger intelligence. By proving what works on the ground, WildArc aims to become an open-source teaching model.
                            We want to empower other farmers and communities by sharing exact, data-backed methodologies to replicate self-sustaining ecosystems.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-forest-700 mb-2">The Ecosystem Suite</h2>
                        <p className="mb-2">This application is part of a growing, synergistic software suite modeled after the ecosystem itself:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Arbor (Current Module):</strong> The foundational canopy. Managing trees, large perennials, and spatial tracking.</li>
                            <li><strong>Flora (Upcoming):</strong> For understory companions, vines, and agricultural crops. Focuses on symbiotic <em>Guilds</em>.</li>
                            <li><strong>Terra (Upcoming):</strong> The foundational earth layer. Soil telemetry, topographical zones, and water flow maps.</li>
                            <li><strong>Myco (Future):</strong> For the unseen networks. Fungi, soil microbiology, and holistic balance tracking.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-forest-700 mb-2">Data-Driven Mind Maps</h2>
                        <p>
                            In nature, success relies on connection, not isolation. As our data grows, this platform will generate interactive Mind Maps.
                            Instead of static lists, you will visibly see the synergistic connections between companion plants—revealing exactly which Guilds thrive together mathematically, establishing clear ecological insights.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
