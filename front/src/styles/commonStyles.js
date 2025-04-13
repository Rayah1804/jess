// Styles communs pour tous les composants
export const commonStyles = {
    backgroundContainer: {
        minHeight: '100vh',
        background: '#0052cc',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
    },
    contentWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        position: 'relative',
        zIndex: 2
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 82, 204, 0.9) 0%, rgba(0, 119, 255, 0.9) 100%)',
        zIndex: 1
    },
    formControl: {
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        transition: 'all 0.3s ease'
    },
    button: {
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        transition: 'all 0.3s ease',
        fontWeight: '500'
    },
    title: {
        color: '#1a1a1a',
        marginBottom: '1.5rem',
        fontWeight: '600'
    }
};

export default commonStyles; 