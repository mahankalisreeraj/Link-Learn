import React, { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/useSessionStore';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}


const VideoPanel: React.FC = () => {
    const { isVideoEnabled, sessionId } = useSessionStore();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);

    useEffect(() => {
        if (!isVideoEnabled || !sessionId) {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            return;
        }

        const loadJitsi = () => {
            if (window.JitsiMeetExternalAPI) {
                startMeeting();
            } else {
                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.onload = () => startMeeting();
                document.body.appendChild(script);
            }
        };

        const startMeeting = () => {
            if (!jitsiContainerRef.current) return;

            const domain = 'meet.jit.si';
            const options = {
                roomName: `LinkAndLearn-${sessionId}`,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: ['microphone', 'camera', 'fullscreen', 'hangup'],
                    SHOW_JITSI_WATERMARK: false
                }
            };
            // @ts-ignore
            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        };

        loadJitsi();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        };
    }, [isVideoEnabled, sessionId]);

    if (!isVideoEnabled) return null;

    return (
        <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-lg border border-slate-700" ref={jitsiContainerRef}>
            {/* Jitsi mounts here */}
        </div>
    );
};

export default VideoPanel;
