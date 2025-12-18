'use client'

import { useServers } from '@/hooks/use-servers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface DeleteServerDialogProps {
  serverId: string | null
  serverName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteServerDialog({
  serverId,
  serverName,
  open,
  onOpenChange,
}: DeleteServerDialogProps) {
  const router = useRouter()
  const { deleteServer, isDeleting } = useServers()

  const handleDelete = () => {
    if (!serverId) return

    deleteServer(serverId, {
      onSuccess: () => {
        toast({
          title: 'Server deleted',
          description: 'Your server has been deleted successfully.',
        })
        onOpenChange(false)
        router.push('/servers')
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete server',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{serverName}</strong> and all associated data. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Server'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
