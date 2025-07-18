const LightDirSelector = () => {
    const handleSubmit = (event) => {
        event.preventDefault()
    }
    return <form onSubmit={handleSubmit}>
        <input type="number" max={1} min={-1} />
        <input type="number" max={1} min={-1} />
        <input type="number" max={1} min={-1} />
        <input type="submit" value="Select"/>
    </form>
}

export default LightDirSelector