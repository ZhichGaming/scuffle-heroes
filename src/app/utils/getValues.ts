export default function getValues(obj: any): any[] {
    return Object.keys(obj).map(key => obj[key]);
}
